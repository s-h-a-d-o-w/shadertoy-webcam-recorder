## TODO

- Will probably have to convert this into an Electron app. Keeping more than 5 Minutes of HD footage in RAM doesn't make browsers happy (MB 
are webm video file sizes, not RAM use):

#### Chrome  
Works: 4 minutes, 82 MB  
Tab crash @ 100 MB / 4m8s of processed video

#### Firefox
Works: 3:30 minutes, 140 MB  
ffmpeg reports "out of memory" @ 278 MB / 6m34s of video

- Actually make shaders from shadertoy available...

- Check whether pathetic frame rates mostly stem from capturing streams. I can't do anything about that but at least then I know that IF maybe 
stream capturing ran on a different thread (web workers won't work - no access to DOM), performance would be better.    

#### i7-2600K @ 5.9 Ghz (+ 7970 GHz Edition), Microsoft HD-3000  
CH: 1280x720@30fps // 60 fps

#### Celeron G3900T, Microsoft HD-3000  
FF: 1280x720@30fps // ~30 fps (50-60 when not doing stream capturing)  
CH: 1280x720@30fps // ~24 fps ([Texture upload bug](https://bugs.chromium.org/p/chromium/issues/detail?id=92388))

#### Samsung S7  
FF: 1920x1080@30fps // ~10 fps  
CH: 1920x1080@30fps // ~4 fps
