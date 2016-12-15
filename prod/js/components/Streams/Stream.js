import React from "react";

import StreamInfo from "./StreamInfo";

import Blink from "../Blink";

export default class Stream extends React.Component {
  render() {
    const isOnlineClass = (this.props.online) ? " online" : "";

    const info = (this.props.online) ? (<StreamInfo
      streamTitle={this.props.streamTitle}
      game={this.props.game}
      liveSince={this.props.liveSince}
      viewers={this.props.viewers}
      timeNow={this.props.timeNow}
    />) : null;

    const liveImg = (this.props.liveImg) ? this.props.liveImg : `./img/${this.props.streamHost}_place.png`;

    return (
      <Blink customTag="a" href={this.props.liveUrl} className={`stream ${this.props.streamHost}${isOnlineClass}`} rel="noreferrer noopener" target="_blank" >
        <div>
          <div className="image" style={{ "backgroundImage": `url(${liveImg})` }} />

          <div className="info">
            <p className={`streamerName${isOnlineClass}`}>{this.props.streamerName}</p>
            { info }
          </div>
        </div>
      </Blink>
    );
  }
}

Stream.propTypes = {
  online: React.PropTypes.bool,
  streamHost: React.PropTypes.string.isRequired,
  streamerName: React.PropTypes.string.isRequired,
  streamTitle: React.PropTypes.string,
  game: React.PropTypes.string,
  liveSince: React.PropTypes.string,
  viewers: React.PropTypes.string,
  liveImg: React.PropTypes.string,
  liveUrl: React.PropTypes.string,
  timeNow: React.PropTypes.instanceOf(Date),
};

Stream.defaultProps = {
  liveImg: "none",
};
