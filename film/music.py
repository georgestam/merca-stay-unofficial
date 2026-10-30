"""Original instrumental: soft marimba, bass and brushed percussion, 96 BPM.
No samples or external music. Exactly 60 seconds. Requires numpy.
Usage: python3 film/music.py /path/to/music.wav
"""
import sys, wave
import numpy as np
RATE=48000
DURATION=60
sound=np.zeros((RATE*DURATION,2),dtype=np.float64)
rng=np.random.default_rng(20261030)
beat=60/96
def add(start,freq,seconds,amp,pan=0,kind='note'):
    count=int(seconds*RATE)
    t=np.arange(count)/RATE
    if kind=='note':
        y=(np.sin(2*np.pi*freq*t)+.25*np.sin(2*np.pi*freq*2.01*t))*np.exp(-t*5.2)
    elif kind=='bass':
        y=np.sin(2*np.pi*freq*t)*np.exp(-t*3)
    elif kind=='kick':
        y=np.sin(2*np.pi*(55*t+8*(1-np.exp(-t*25))))*np.exp(-t*23)
    else:
        y=rng.normal(0,1,count)*np.exp(-t*65)*.25
    y*=amp*np.minimum(t*200,1)
    start=int(start*RATE)
    count=min(count,len(sound)-start)
    if count>0:
        sound[start:start+count,0]+=y[:count]*(1-pan*.4)
        sound[start:start+count,1]+=y[:count]*(1+pan*.4)
chords=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]]
for b in range(96):
    at=b*beat
    chord=chords[(b//8)%4]
    if b%2==0:add(at,440*2**((chord[0]-24-69)/12),1,.16,kind='bass')
    if b%4 in (0,2):add(at,55,.4,.13,kind='kick')
    add(at+.31,1,.12,.1,pan=(-1)**b*.5,kind='brush')
    note=chord[(b*3+b//8)%4]+12
    add(at,440*2**((note-69)/12),1.1,.13,pan=np.sin(b)*.7)
    if b%4==3:add(at+.3125,440*2**((chord[2]+12-69)/12),.8,.07,pan=-.5)
# A restrained soft accent on each chapter. No sudden loud effects.
for start in np.arange(0,60,7.5):add(float(start),880,.65,.06,pan=.25)
times=np.arange(len(sound))/RATE
sound*=np.minimum(times/1.6,1)[:,None]*np.minimum((DURATION-times)/3,1)[:,None]
sound=np.tanh(sound*1.4)*.72
pcm=(sound*32767).astype('<i2')
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(pcm.tobytes())
print(f'Wrote original {DURATION}s stereo soundtrack.')
