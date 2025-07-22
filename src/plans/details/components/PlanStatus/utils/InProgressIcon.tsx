const InProgressIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 1024 1024" fill="currentColor" height="1em" width="1em" {...props}>
    <path
      fillRule="evenodd"
      d="M512,.4C229.5.4.5,229.4.5,511.9s229,511.5,511.5,511.5,511.5-229,511.5-511.5S794.5.4,512,.4ZM746.5,241.3c0,193.7-193.7,192.4-193.7,271.2s193.7,77.5,193.7,271.2v19.4c0,10.7-8.7,19.4-19.4,19.4h-426.2c-10.7,0-19.4-8.7-19.4-19.4v-19.4c0-195,193.7-195,193.7-271.2s-193.7-78.8-193.7-271.2v-19.4c0-10.7,8.7-19.4,19.4-19.4h426.2c10.7,0,19.4,8.7,19.4,19.4v19.4ZM625,745h-222c-3.6,0-2.5-10.9-1.1-20.8,9-63.3,73.5-84,91.8-90.2q20.7-6.9,40.8,0c18.3,6.4,83.2,28,91.9,90.5,1.3,9.9,2.5,20.6-1.1,20.6"
    />
  </svg>
);

InProgressIcon.displayName = 'InProgressIcon';

export default InProgressIcon;
