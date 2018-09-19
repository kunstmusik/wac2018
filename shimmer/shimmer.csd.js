const TEST_CSD = 
`
<CsoundSynthesizer>
<CsOptions>
-i adc -o dac -m0
</CsOptions>
<CsInstruments>

sr	=	48000
ksmps	= 32	
nchnls=	2
nchnls_i =	1
0dbfs	=	1

gal init 0
gar init 0

instr Syn
  asig = vco2(p5, p4)
  asig = zdf_ladder(asig, expsegr(10000, 0.2, 100, 0.2, 100), 12)
  asig *= linsegr(1, 0.2, 0)

  out(asig, asig)
  gal += asig * 0.2
  gar += asig * 0.2

endin

instr ShimmerReverb 
  ain = tanh(inch(1) * 0.25)
  al = ain + gal
  ar = ain + gar

  ; pre-delay
  al = vdelay3(al, 100, 100)
  ar = vdelay3(ar, 100, 100)
 
  afbl init 0
  afbr init 0
  ifblvl = 0.45


  al = al + (afbl * ifblvl)
  ar = ar + (afbr * ifblvl)

  ; important, or signal bias grows rapidly
  al = dcblock2(al)
  ar = dcblock2(ar)

  al = tanh(al)
  ar = tanh(ar)

  al, ar reverbsc al, ar, 0.95, 16000

  iratio =  1.5 
  ideltime = 100

  ifftsize  = 2048 
  ioverlap  = ifftsize / 4 
  iwinsize  = ifftsize 
  iwinshape = 1; von-Hann window 

  fftin     pvsanal al, ifftsize, ioverlap, iwinsize, iwinshape 
  fftscale  pvscale fftin, iratio, 0, 1
  atransL   pvsynth fftscale

  fftin2    pvsanal ar, ifftsize, ioverlap, iwinsize, iwinshape 
  fftscale2 pvscale fftin2, iratio, 0, 1
  atransR   pvsynth fftscale2

  ;; delay the feedback to let it build up over time
  afbl = vdelay3(atransL, ideltime, ideltime)
  afbr = vdelay3(atransR, ideltime, ideltime)

  out(al, ar)

  gal = 0
  gar = 0
  
endin
schedule("ShimmerReverb", 0, -1)


</CsInstruments>
; ==============================================
<CsScore>
f0 3000000
</CsScore>
</CsoundSynthesizer>

`;
