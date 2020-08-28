import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { breakpoints } from '../style-vars';

const noop = () => {};

/*
 * We need to set the width/height of the player depending on what the dimensions of
 * the underlying video source is.
 *
 * On most platforms we know the dimensions on 'loadedmetadata'
 * On Desktop Safari we don't know the dimensions until 'canplay'
 *
 * At first, I tried to get the dimensions of the video from these callbacks, that worked
 * great except for on moble Safari. On Mobile Safari none of those callbacks fire until
 * there is some user interaction :(
 *
 * BUT! There is a brilliant hack here. We can create a `display: none` `img` element in the
 * DOM, load up the poster image.
 *
 * Since the poster image will have the same dimensions of the video, now we know if the video
 * is vertical and now we can style the proper width/height so the layout doesn't have a sudden
 * jump or resize.
 *
 */
export default function VideoPlayer ({ src, poster, onLoaded, onError = noop }) {
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const [isVertical, setIsVertical] = useState();

  const error = (event) => onError(event);

  const onImageLoad = (event) => {
    event.persist();
    const [w, h] = [event.target.width, event.target.height];
    if (w && h) {
      setIsVertical((w / h) < 1);
      onLoaded();
    } else {
      onLoaded();
      console.error('Error getting img dimensions', event); // eslint-disable-line no-console
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    let hls;
    if (video) {
      video.addEventListener('error', error);

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // This will run in safari, where HLS is supported natively
        video.src = src;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        console.error( // eslint-disable-line no-console
          'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
        );
      }
    }

    return () => {
      video.removeEventListener('error', error);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, videoRef]);

  return (
    <>
      <video ref={videoRef} poster={poster} controls />
      <img ref={imageRef} src={poster} onLoad={onImageLoad} alt="Thumbnail" />
      <style jsx>{`
        img {
          display: none;
        }
        video {
          display: block;
          width: ${isVertical ? 'auto' : '1000px'};
          height: ${isVertical ? '600px' : 'auto'};
          max-width: 100%;
          max-height: 50vh;
          cursor: pointer;
          margin-top: 40px;
          margin-bottom: 40px;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          video {
            max-height: 80vh;
          }
        }
      `}
      </style>
    </>
  );
}
