import React from "react";

export default class StreamInfo extends React.Component {
  date() {
    const to2dig = (a) => {
      return `00${a}`.slice(-2);
    };

    const now = this.props.timeNow;
    let milis = 1000 * 60 * 60;
    let delta = now.getTime() - Date.parse(this.props.liveSince);

    const hours = Math.floor(delta / milis);
    delta -= hours * milis;
    milis /= 60;

    const minutes = Math.floor(delta / milis);
    delta -= minutes * milis;

    return `${to2dig(hours)}:${to2dig(minutes)} h`;
  }

  render() {
    return (
      <div className="streamInfo">
        <p className="streamTitle">{this.props.streamTitle}</p>
        <p className="game">Gra w: {this.props.game}</p>
        <p className="liveSince">Na żywo od: {this.date()}</p>
        <p className="viewers">Widzowie: {this.props.viewers}</p>
      </div>
    );
  }
}

StreamInfo.propTypes = {
  streamTitle: React.PropTypes.string,
  game: React.PropTypes.string,
  liveSince: React.PropTypes.string,
  viewers: React.PropTypes.string,
  timeNow: React.PropTypes.instanceOf(Date),
};
