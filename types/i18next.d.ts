import 'react-i18next';

// react-i18next derives a <Trans> key from its JSX children, and an interpolated value must be
// written as an object child (`<strong>{{ exampleValue }}</strong>`) so the key keeps the `{{exampleValue}}`
// placeholder instead of inlining the runtime value. React's own `children` type rejects plain
// objects, in order to prevent attempted renders of elements which can not be rendered.
// However, react-i18next's <Trans> component intercepts children before React renders them.
// Reference: https://react.i18next.com/latest/trans-component#trans-props
declare module 'i18next' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
  }
}
