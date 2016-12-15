import React from "react";

import Stream from "./Streams/Stream";

import StreamersStore from "../stores/StreamersStore";

import Blink from "../components/Blink";

import * as StreamersActions from "../actions/StreamersActions";

export default class Streams extends React.Component {
  constructor() {
    super();
    this.refreshStreams = this.refreshStreams.bind(this);
    this.toggleOnlineCard = this.toggleOnlineCard.bind(this);
    this.toggleOfflineCard = this.toggleOfflineCard.bind(this);

    this.state = {
      "twitch": StreamersStore.returnTwitchStreams(),
      "hitbox": StreamersStore.returnHitboxStreams(),
      "visibleCategories": {
        "online": true,
        "offline": false,
      },
      "ripple": {
        "online": false,
        "offline": false,
      },
    };
  }

  componentWillMount() {
    StreamersStore.on("change", this.refreshStreams);

    StreamersActions.getAllStreams();
  }

  componentWillUnmount() {
    StreamersStore.removeListener("change", this.refreshStreams);
  }

  refreshStreams() {
    this.setState({
      "twitch": StreamersStore.returnTwitchStreams(),
      "hitbox": StreamersStore.returnHitboxStreams(),
    });
  }

  toggleOnlineCard() {
    this.setState({
      "visibleCategories": {
        "online": !this.state.visibleCategories.online,
        "offline": this.state.visibleCategories.offline,
      },
    });
  }

  toggleOfflineCard() {
    this.setState({
      "visibleCategories": {
        "online": this.state.visibleCategories.online,
        "offline": !this.state.visibleCategories.offline,
      },
    });
  }

  render() {
    const hitboxStreams = [];
    const hitboxStreamsOffline = [];
    const twitchStreams = [];
    const twitchStreamsOffline = [];

    this.state.hitbox.forEach((v) => {
      const streams = (v.online) ? hitboxStreams : hitboxStreamsOffline;
      streams.push(
        <Stream
          online={v.online}
          streamHost={v.streamHost}
          streamerName={v.streamerName}
          streamTitle={v.streamTitle}
          game={v.game}
          liveSince={v.liveSince}
          viewers={v.viewers}
          liveImg={v.liveImg}
          liveUrl={v.liveUrl}
          timeNow={v.timeNow}
          key={`${v.streamerId}-${v.streamHost}`}
        />,
      );
    });

    this.state.twitch.forEach((v) => {
      const streams = (v.online) ? twitchStreams : twitchStreamsOffline;
      streams.push(
        <Stream
          online={v.online}
          streamHost={v.streamHost}
          streamerName={v.streamerName}
          streamTitle={v.streamTitle}
          game={v.game}
          liveSince={v.liveSince}
          viewers={v.viewers}
          liveImg={v.liveImg}
          liveUrl={v.liveUrl}
          timeNow={v.timeNow}
          key={`${v.streamerId}-${v.streamHost}`}
        />,
      );
    });

    return (
      <div>
        <Blink customTag="button" id="btn-online" onClick={this.toggleOnlineCard}>
          <h2>Strumyki online <i className="material-icons">{ (this.state.visibleCategories.online) ? "keyboard_arrow_up" : "keyboard_arrow_down"}</i></h2>
        </Blink>

        <div id="online" className={`card${(this.state.visibleCategories.online) ? " visible" : ""}`}>
          { hitboxStreams }
          { twitchStreams }
        </div>

        <Blink customTag="button" id="btn-offline" onClick={this.toggleOfflineCard}>
          <h2>Strumyki offline <i className="material-icons">{ (this.state.visibleCategories.offline) ? "keyboard_arrow_up" : "keyboard_arrow_down"}</i></h2>
        </Blink>

        <div id="offline" className={`card${(this.state.visibleCategories.offline) ? " visible" : ""}`}>
          { hitboxStreamsOffline }
          { twitchStreamsOffline }
        </div>
      </div>
    );
  }
}
