import React from "react";

export default class Blink extends React.Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);

    this.uniqueId = 0;
    this.state = {
      "blinkBlinks": [],
    };
  }

  onClick(e) {
    const el = this.blinkElement;

    const size = Math.max( el.offsetWidth, el.offsetHeight ) / 2;
    const i = this.uniqueId.toString();

    const onAnimationEnd = () => {
      const blinkBlinks = this.state.blinkBlinks.slice();

      delete blinkBlinks[i];
      this.setState({ blinkBlinks });
    };

    const newBlink = (
      <span
        onAnimationEnd={onAnimationEnd}
        key={this.uniqueId}
        className="blink-big-blink"
        style={{
          "width": `${size}px`,
          "height": `${size}px`,
          "top": e.pageY - (el.offsetTop || 0),
          "left": e.pageX - (el.offsetLeft || 0),
        }}
      />
    );


    const blinkBlinks = this.state.blinkBlinks.slice();

    blinkBlinks[this.uniqueId.toString()] = newBlink;

    this.setState({
      "blinkBlinks": blinkBlinks,
    });

    this.uniqueId++;

    this.props.onClick(e);
  }

  render() {
    const children = this.props.children;
    const CustomTag = this.props.customTag || "div";
    const className = (this.props.className) ? ` ${this.props.className}` : "";

    const props = {};

    /* eslint-disable */
    for (let prop in this.props) {
      const forbidden = ["children", "customTag", "className", "onClick", "ref"];
      if (this.props.hasOwnProperty(prop) && forbidden.indexOf(prop) < 0) {
        props[prop] = this.props[prop];
      }
    }
    /* eslint-enable */

    return (
      <CustomTag
        ref={(b) => { this.blinkElement = b; }}
        onClick={this.onClick}
        className={`blink-big blink-black blink-parent${className}`}
        {...props}
      >
        {children}

        {this.state.blinkBlinks}
      </CustomTag>
    );
  }
}

Blink.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element,
  ]).isRequired,
  customTag: React.PropTypes.string,
  className: React.PropTypes.string,
  onClick: React.PropTypes.func,
};
