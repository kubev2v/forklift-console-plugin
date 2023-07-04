import React from 'react';

import './button.css';

/**
 * ### Description
 * A button is a box area or text that communicates and triggers user actions when
 * clicked or selected.
 * * Buttons can be used to communicate and immediately trigger
 * actions a user can take in an application, like submitting a form, canceling a process,
 * or creating a new object.
 * * Buttons can also be used to take a user to a new location,
 * like another page inside of a web application, or an external site such as help or
 * documentation
 *
 * * markdown ex: **bla bla**, *bla bla*,``redcarpet``
 *
 *
 * * Visit [StoriesOnBoard](http://www.storiesonboard.com)
 *
 * http://www.storiesonboard.com
 *
 * ```
 * an Example for a button
 * bla bla
 *
 * ```
 *
 * view ![Mockup1](https://media.tenor.com/l9jsaYVcHk4AAAAi/push-button.gif)
 *
 */
export const Button: React.FC<ButtonProps> = ({
  primary = true,
  backgroundColor = null,
  size = 'medium',
  label,
  ...props
}) => {
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
      style={backgroundColor && { backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * The button label
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}
