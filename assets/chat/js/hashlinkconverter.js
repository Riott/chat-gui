const RUMBLE_EMBED_ERROR =
  'Rumble links have to be embed links - https://rumble.com/embed/<id>';
const MISSING_ARG_ERROR = 'Missing argument';
const INVALID_LINK_ERROR = 'Invalid link';
const MISSING_VIDEO_ID_ERROR = 'Invalid Youtube link - Missing video id';

class HashLinkConverter {
  constructor() {
    this.hasHttp = /^http[s]?:\/{0,2}/;
    this.youtubeLiveRegex = /^live\/([A-Za-z0-9-_]{11})$/;
    this.twitchClipRegex = /^[^/]+\/clip\/([A-Za-z0-9-_]*)$/;
    this.twitchVODRegex = /^videos\/(\d+)$/;
    this.rumbleEmbedRegex = /^embed\/([a-z0-9]+)\/?$/;
  }

  convert(urlString, throwErrors) {
    if (!urlString && throwErrors) {
      throw new Error(MISSING_ARG_ERROR);
    }
    const url = new URL(
      // if a url doesn't have a protocol, URL throws an error
      urlString.match(this.hasHttp) ? urlString : `https://${urlString}`
    );
    const pathname = url.pathname.slice(1);
    let match;
    let videoId;
    switch (url.hostname) {
      case 'www.twitch.tv':
      case 'twitch.tv':
        match = pathname.match(this.twitchClipRegex);
        if (match) {
          return `#twitch-clip/${match[1]}`;
        }
        match = pathname.match(this.twitchVODRegex);
        if (match) {
          return `#twitch-vod/${match[1]}`;
        }
        return `#twitch/${pathname}`;
      case 'clips.twitch.tv':
        return `#twitch-clip/${pathname}`;
      case 'www.youtube.com':
      case 'youtube.com':
        match = pathname.match(this.youtubeLiveRegex);
        if (match) {
          return `#youtube/${match[1]}`;
        }
        videoId = url.searchParams.get('v');
        if (!videoId) {
          if (throwErrors) throw new Error(MISSING_VIDEO_ID_ERROR);
          return '';
        }
        return `#youtube/${videoId}`;
      case 'www.youtu.be':
      case 'youtu.be':
        return `#youtube/${pathname}`;
      case 'www.rumble.com':
      case 'rumble.com':
        match = pathname.match(this.rumbleEmbedRegex);
        if (match) {
          return `#rumble/${match[1]}`;
        }
        if (throwErrors) throw new Error(RUMBLE_EMBED_ERROR);
        return '';
      case 'www.kick.com':
      case 'kick.com':
        return `#kick/${pathname}`;
      default:
        if (throwErrors) throw new Error(INVALID_LINK_ERROR);
        return '';
    }
  }
}

export {
  HashLinkConverter,
  RUMBLE_EMBED_ERROR,
  INVALID_LINK_ERROR,
  MISSING_VIDEO_ID_ERROR,
  MISSING_ARG_ERROR,
};
