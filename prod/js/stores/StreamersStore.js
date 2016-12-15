import { EventEmitter } from "events";

import axios from "axios";

import dispatcher from "../dispatcher";


class StreamersStore extends EventEmitter {
  constructor() {
    super();
    this.returnTwitchStreams = this.returnTwitchStreams.bind(this);
    this.returnHitboxStreams = this.returnHitboxStreams.bind(this);
    this.getTwitchStreams = this.getTwitchStreams.bind(this);
    this.getHitboxStreams = this.getHitboxStreams.bind(this);
    this.getAllStreams = this.getAllStreams.bind(this);

    this.twitchHeader = { headers: { "Client-ID": "4jy73tq3cfgqeb491i4w2zoq6ejf2y" } };

    this.user_follows = {
      "twitch": [],
      "hitbox": [],
    };

    this.streamsToUpdate = [];

    this.streams = {
      "twitch": [],
      "hitbox": [],
    };

    this.interval = setInterval( () => {
      this.streamsToUpdate.forEach((v) => {
        this.getViewers(v.host, v.i);
        this.updateDate(v.host, v.i);
      });
    }, 2 * 1000);
  }

  getTwitchStreams() {
    this.user_follows.twitch.forEach((v) => {
      axios.get(`https://api.twitch.tv/kraken/streams/${v}`, this.twitchHeader)
        .then((response) => {
          if ( response.data.stream !== null ) {
            const livestream = response.data.stream;
            this.streamsToUpdate.push({
              host: "twitch",
              i: this.streams.twitch.length,
            });

            this.streams.twitch.push({
              online: true,
              streamerId: livestream.channel.name,
              streamerName: livestream.channel.display_name,
              streamTitle: livestream.channel.status,
              game: livestream.game,
              liveSince: livestream.created_at,
              viewers: livestream.viewers.toString(),
              liveImg: livestream.preview.medium,
              liveUrl: livestream.channel.url,
              streamHost: "twitch",
              timeNow: new Date(),
            });

            this.emit("change");
          } else {
            axios.get(`https://api.twitch.tv/kraken/channels/${v}`, this.twitchHeader)
              .then((responseChannel) => {
                const livestream = responseChannel.data;

                this.streams.twitch.push({
                  online: false,
                  streamerId: livestream.name,
                  streamerName: livestream.display_name,
                  streamTitle: null,
                  game: null,
                  liveSince: null,
                  viewers: null,
                  liveImg: livestream.video_banner,
                  liveUrl: livestream.url,
                  streamHost: "twitch",
                  timeNow: new Date(),
                });

                this.emit("change");
              });
          }
        });
    });
  }

  getHitboxStreams() {
    this.user_follows.hitbox.forEach((v) => {
      axios.get(`https://api.hitbox.tv/media/live/${v}`)
        .then((response) => {
          const livestream = response.data.livestream[0];
          let isOnline = false;
          let liveImg = `http://edge.sf.hitbox.tv${livestream.media_bg_image}`;

          if ( livestream.media_is_live === "1" ) {
            liveImg = `http://edge.sf.hitbox.tv${livestream.media_thumbnail}`;
            isOnline = true;

            this.streamsToUpdate.push({
              host: "hitbox",
              i: this.streams.hitbox.length,
            });
          }

          this.streams.hitbox.push({
            online: isOnline,
            streamerId: livestream.media_name,
            streamerName: livestream.media_user_name,
            streamTitle: livestream.media_status,
            game: livestream.category_name,
            liveSince: livestream.media_live_since,
            viewers: livestream.media_views,
            liveImg,
            liveUrl: livestream.channel.channel_link,
            streamHost: "hitbox",
            timeNow: new Date(),
          });

          this.emit("change");
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  getAllStreams() {
    axios.get("https://api.twitch.tv/kraken/users/bibix1999/follows/channels", this.twitchHeader)
      .then((response) => {
        const userFollows = [];
        response.data.follows.forEach((v) => {
          userFollows.push( v.channel.name );
        });

        this.user_follows.twitch = userFollows;

        this.getTwitchStreams();
      });

    axios.get("https://api.hitbox.tv/following/user?user_name=bibixx")
      .then((response) => {
        const userFollows = [];
        response.data.following.forEach((v) => {
          userFollows.push( v.user_name );
        });

        this.user_follows.hitbox = userFollows;

        this.getHitboxStreams();
      });
  }

  getViewers(host, i) {
    if ( host === "twitch" ) {
      return this.updateTwitchData(i);
    } else if ( host === "hitbox" ) {
      return this.updateHitboxData(i);
    }

    return 0;
  }

  updateTwitchData(i) {
    axios.get(`https://api.twitch.tv/kraken/streams/${this.streams.twitch[i].streamerId}`, this.twitchHeader)
      .then((response) => {
        const livestream = response.data.stream;
        if ( livestream !== null ) {
          this.streams.twitch[i].online = true;
          this.streams.twitch[i].viewers = livestream.viewers.toString();
          this.streams.twitch[i].streamTitle = livestream.channel.status;
          this.streams.twitch[i].game = livestream.game;
        } else {
          this.streams.twitch[i].online = false;
        }

        this.emit("change");
      });
  }

  updateHitboxData(i) {
    axios.get(`https://api.hitbox.tv/media/live/${this.streams.hitbox[i].streamerId}`)
      .then((response) => {
        const livestream = response.data.livestream[0];
        this.streams.hitbox[i].online = (livestream.media_is_live === "1");
        this.streams.hitbox[i].viewers = livestream.media_views;
        this.streams.hitbox[i].streamTitle = livestream.media_status;
        this.streams.hitbox[i].game = livestream.category_name;

        this.emit("change");
      });
  }

  updateDate(host, i) {
    this.streams[host][i].timeNow = new Date();

    this.emit("change");
  }

  returnTwitchStreams() {
    return this.streams.twitch;
  }

  returnHitboxStreams() {
    return this.streams.hitbox;
  }

  returnViewers(host, i) {
    return this.streams[host][i].viewers;
  }

  /* eslint-disable default-case, indent */
  handleActions(action) {
    switch (action.type) {
      case "GET_STREAMS":
        this.getAllStreams();
        break;
    }
  }
  /* eslint-enable default-case, indent */
}

const streamersStore = new StreamersStore();
dispatcher.register(streamersStore.handleActions.bind(streamersStore));

export default streamersStore;
