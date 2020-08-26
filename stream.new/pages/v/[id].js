import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import FullpageSpinner from '../../components/fullpage-spinner';
import VideoPlayer from '../../components/video-player';
import Layout from '../../components/layout';
import { breakpoints } from '../../style-vars';

export function getStaticProps ({ params: { id: playbackId } }) {
  const src = `https://stream.mux.com/${playbackId}.m3u8`;
  const poster = `https://image.mux.com/${playbackId}/thumbnail.png`;
  const shareUrl = `https://stream.new/v/${playbackId}`;

  return { props: { playbackId, src, poster, shareUrl } };
}

const InfoLink = () => <Link href="/about"><a>Info</a></Link>;
const HomeLink = () => <Link href="/"><a>Home</a></Link>;

export function getStaticPaths () {
  return {
    paths: [],
    fallback: true,
  };
}

export default function Playback ({ shareUrl, src, poster }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout
        metaTitle="View this video created on stream.new"
        image={poster}
        footerLinks={[<InfoLink />, <HomeLink />]}
        darkMode
      >
        <FullpageSpinner />;
      </Layout>
    );
  }

  const onError = (evt) => {
    setErrorMessage('This video does not exist');
    console.error('Error', evt); // eslint-disable-line no-console
  };

  return (
    <Layout
      metaTitle="View this video created on stream.new"
      image={poster}
      footerLinks={[<InfoLink />, <HomeLink />]}
      darkMode
    >
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {!isLoaded && !errorMessage && <FullpageSpinner />}
      <div className="wrapper">
        <VideoPlayer src={src} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />
        <div className="share-url">{shareUrl}</div>
      </div>
      <style jsx>{`
        .error-message {
          color: #ccc;
        }
        .wrapper {
          display: ${isLoaded ? 'flex' : 'none'};
          flex-direction: column;
          flex-grow: 1;
        }
        .share-url {
          word-break: break-word;
          color: #777;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          .wrapper {
            align-items: center;
            justify-content: center;
          }
        }
      `}
      </style>
    </Layout>
  );
}
