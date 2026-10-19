/*
 * The band. Everything here is synthesised with the Web Audio API, so there
 * are no sound files to download.
 *
 * The arrangement grows with the level: one triangle chime at level 1, a
 * trumpet solo from level 14, and a full big band by level 30. Browsers only
 * allow audio after a gesture, so the first key press wakes it up.
 */

const Sound = (function () {
  let ctx = null;
  let comp = null;
  let limiter = null;
  let out = null; // bus for the celebration currently playing
  let noise = null;
  let muted = false;

  try {
    muted = localStorage.getItem("julie-muted") === "1";
  } catch (err) {
    /* private mode: just start unmuted */
  }

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const PENTATONIC = [0, 2, 4, 7, 9];
  const ROOT = 60; // middle C

  /* ---------- setup ---------- */

  function impulse(seconds, decay) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < n; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
      }
    }
    return buffer;
  }

  function noiseBuffer() {
    const n = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function ensure() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return Boolean(ctx);
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    ctx = new AudioCtx();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    // Everything, reverb included, passes the limiter last so a full band
    // cannot clip the output.
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.12;
    limiter.connect(ctx.destination);

    const volume = ctx.createGain();
    volume.gain.value = 0.75;
    comp.connect(volume);
    volume.connect(limiter);

    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(1.8, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.2;
    volume.connect(reverb);
    reverb.connect(wet);
    wet.connect(limiter);

    noise = noiseBuffer();
    return true;
  }

  /* ---------- instruments ---------- */

  function shape(gain, t, attack, hold, release, peak) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.setValueAtTime(peak, t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  }

  function chime(freq, t, dur = 1.8, peak = 0.3) {
    [[1, peak], [2.76, peak * 0.3], [5.4, peak * 0.1]].forEach(([mult, level]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  function glock(freq, t, peak = 0.22) {
    chime(freq, t, 0.9, peak);
  }

  function marimba(freq, t, peak = 0.26) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = freq * 6;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  function brass(freq, t, dur, peak = 0.22) {
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(freq * 6 + 900, t + 0.09);
    filter.frequency.linearRampToValueAtTime(freq * 3 + 500, t + dur);

    [0, 8].forEach((detune) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.1);
      // a little vibrato once the note has settled, like a real player
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 5.5;
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(7, t + Math.min(0.35, dur));
      lfo.connect(depth);
      depth.connect(osc.detune);
      lfo.start(t);
      lfo.stop(t + dur + 0.1);
    });

    shape(gain, t, 0.05, Math.max(0.02, dur - 0.18), 0.16, peak);
    filter.connect(gain);
    gain.connect(out);
  }

  function sax(freq, t, dur, peak = 0.16) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.value = freq;
    filter.type = "bandpass";
    filter.frequency.value = freq * 2.4;
    filter.Q.value = 3;
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 6;
    depth.gain.value = 9;
    lfo.connect(depth);
    depth.connect(osc.detune);
    shape(gain, t, 0.06, Math.max(0.02, dur - 0.2), 0.18, peak);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + dur + 0.1);
    lfo.stop(t + dur + 0.1);
  }

  function pad(freqs, t, dur, peak = 0.07) {
    freqs.forEach((freq) => {
      [-6, 6].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        filter.type = "lowpass";
        filter.frequency.value = 1500;
        shape(gain, t, 0.25, Math.max(0.05, dur - 0.9), 0.65, peak);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + dur + 0.2);
      });
    });
  }

  function bass(freq, t, dur, peak = 0.3) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    shape(gain, t, 0.02, Math.max(0.02, dur - 0.1), 0.1, peak);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  function hit(buffer, t, dur, peak, filterType, cutoff, Q) {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    src.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = cutoff;
    if (Q) filter.Q.value = Q;
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  function kick(t, peak = 0.75) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.11);
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  function snare(t, peak = 0.35) {
    hit(noise, t, 0.17, peak, "highpass", 1700);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 190;
    gain.gain.setValueAtTime(peak * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  const hat = (t, open) => hit(noise, t, open ? 0.26 : 0.045, 0.14, "highpass", 7500);
  const shaker = (t) => hit(noise, t, 0.07, 0.09, "highpass", 5200);
  const crash = (t, peak = 0.3) => hit(noise, t, 1.6, peak, "highpass", 3800);

  function tom(t, freq, peak = 0.4) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.25);
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  function timpani(t, freq) {
    tom(t, freq, 0.5);
    hit(noise, t, 0.3, 0.1, "lowpass", 400);
  }

  function riser(t, dur) {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    src.buffer = noise;
    src.loop = true;
    filter.type = "bandpass";
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(6000, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + dur * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(t);
    src.stop(t + dur + 0.2);
  }

  /* ---------- the arrangement ---------- */

  // A cheerful rising run through the pentatonic scale.
  function scaleNote(index, root) {
    return hz(root + 12 * Math.floor(index / 5) + PENTATONIC[index % 5]);
  }

  // Relative semitones and lengths in beats: the trumpet's big moment.
  const TRUMPET_LICK = [
    [7, 0.5], [12, 0.5], [16, 0.5], [19, 1],
    [16, 0.5], [12, 0.5], [14, 0.5], [16, 1.5],
  ];

  const SAX_LINE = [[12, 0.5], [14, 0.5], [16, 0.5], [12, 0.5], [9, 1.5]];

  function play(level) {
    if (muted || !ensure() || !ctx) return;

    const t0 = ctx.currentTime + 0.05;
    const bpm = 96 + level * 2.4;
    const beat = 60 / bpm;
    const bars = level <= 4 ? 1 : level <= 12 ? 2 : level <= 20 ? 3 : level <= 28 ? 4 : 6;
    const beats = bars * 4;
    const chord = [0, 4, 7, 9];

    // Fade out whatever was still ringing, then start a fresh bus.
    if (out) {
      const old = out;
      old.gain.cancelScheduledValues(ctx.currentTime);
      old.gain.setValueAtTime(old.gain.value, ctx.currentTime);
      old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      setTimeout(() => old.disconnect(), 400);
    }
    out = ctx.createGain();
    // A chime should be gentle and a big band should fill the room.
    out.gain.value = 0.45 + level * 0.015;
    out.connect(comp);

    // Second half lifts a whole tone from level 22 — the big band key change.
    const root = ROOT;
    const lift = (t) => (level >= 22 && t > t0 + beat * beats * 0.5 ? 2 : 0);

    /* melody: always present, grows from a single chime to a long run */
    const notes = Math.min(2 + level, 16);
    const step = level < 10 ? beat * 0.5 : beat * 0.25;
    for (let i = 0; i < notes; i++) {
      const t = t0 + i * step;
      const freq = scaleNote(i, root + 12 + lift(t));
      if (level < 4) chime(freq, t, 1.9, 0.32);
      else if (level < 8) glock(freq, t, 0.24);
      else marimba(freq, t, 0.22);
      if (level >= 24) glock(freq * 2, t, 0.12);
    }

    if (level >= 2) chime(hz(root + 24), t0, 2.2, 0.22);

    /* harmony */
    if (level >= 5) bass(hz(root - 12), t0, beat * 2);
    if (level >= 6) {
      pad(chord.map((c) => hz(root + c)), t0, beat * beats, level >= 24 ? 0.09 : 0.06);
    }

    /* light percussion */
    if (level >= 7) {
      for (let i = 0; i < beats * 2; i++) shaker(t0 + i * beat * 0.5);
    }

    /* the horns arrive */
    if (level >= 8) {
      crash(t0, 0.26);
      brass(hz(root + 12), t0, beat * 1.2, 0.26);
    }
    if (level >= 9) {
      chord.forEach((c) => brass(hz(root + 12 + c), t0, beat * 1.4, 0.16));
    }
    if (level >= 10) {
      [[7, 0.5], [12, 0.5], [16, 1]].forEach(([semi, len], i) => {
        brass(hz(root + 12 + semi), t0 + beat * (1.5 + i * 0.5), beat * len, 0.2);
      });
    }

    /* rhythm section */
    if (level >= 11) {
      for (let i = 0; i < 4; i++) snare(t0 + beat * (beats - 1) + i * beat * 0.25, 0.16 + i * 0.04);
    }
    if (level >= 12) {
      for (let bar = 0; bar < bars; bar++) {
        const b = t0 + bar * beat * 4;
        kick(b);
        kick(b + beat * 2);
        snare(b + beat);
        snare(b + beat * 3);
        for (let i = 0; i < 8; i++) hat(b + i * beat * 0.5, i === 7);
      }
    }

    /* TRUMPET SOLO — from here on there is a soloist out front */
    if (level >= 14) {
      let t = t0 + beat * 4;
      TRUMPET_LICK.forEach(([semi, len]) => {
        brass(hz(root + 12 + semi + lift(t)), t, beat * len * 0.95, 0.3);
        t += beat * len;
      });
    }

    /* walking bass */
    if (level >= 16) {
      const walk = [0, 4, 7, 9, 7, 4, 2, 0];
      for (let i = 0; i < beats; i++) {
        const t = t0 + i * beat;
        bass(hz(root - 12 + walk[i % walk.length] + lift(t)), t, beat * 0.9, 0.26);
      }
    }

    /* sax answers the trumpet */
    if (level >= 17) {
      let t = t0 + beat * (bars >= 3 ? 8 : 4);
      SAX_LINE.forEach(([semi, len]) => {
        sax(hz(root + semi + lift(t)), t, beat * len * 0.95, 0.17);
        t += beat * len;
      });
    }

    /* horn section stabs on the offbeats */
    if (level >= 19) {
      for (let i = 1; i < beats; i += 2) {
        const t = t0 + i * beat + beat * 0.5;
        chord.forEach((c) => brass(hz(root + 12 + c + lift(t)), t, beat * 0.35, 0.13));
      }
    }

    /* fills and the heavy artillery */
    if (level >= 21) {
      [0, 1, 2, 3].forEach((i) =>
        tom(t0 + beat * (beats - 2) + i * beat * 0.25, 220 - i * 30, 0.32)
      );
    }
    if (level >= 25) {
      for (let bar = 0; bar < bars; bar++) timpani(t0 + bar * beat * 4, hz(root - 24));
    }
    if (level >= 26) {
      [0, 12, 19, 24].forEach((semi, i) =>
        brass(hz(root + 12 + semi), t0 + beat * (beats - 2) + i * beat * 0.25, beat * 0.5, 0.26)
      );
    }
    if (level >= 28) riser(t0, beat * (beats - 2));

    /* the last chord */
    if (level >= 29) {
      const end = t0 + beat * beats;
      crash(end, 0.4);
      kick(end, 0.9);
      chord.concat([12, 16]).forEach((c) => brass(hz(root + 12 + c), end, beat * 3, 0.2));
      pad(chord.map((c) => hz(root + c)), end, beat * 3.5, 0.1);
    }
    if (level >= 30) {
      const end = t0 + beat * beats;
      for (let i = 0; i < 16; i++) glock(scaleNote(i, root + 24), end + i * beat * 0.12, 0.18);
      timpani(end, hz(root - 24));
      timpani(end + beat * 0.5, hz(root - 24));
    }
  }

  function unlock() {
    ensure();
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem("julie-muted", muted ? "1" : "0");
    } catch (err) {
      /* nothing to remember it with, which is fine */
    }
    if (muted && out) {
      out.gain.cancelScheduledValues(ctx.currentTime);
      out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
      out.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    }
    return muted;
  }

  return { play, unlock, isMuted, toggleMute };
})();
