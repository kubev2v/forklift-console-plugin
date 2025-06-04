import { Button, ButtonVariant, Icon, Tooltip } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const TabTitle = ({ helpContent, title }: { helpContent: string; title: string }) => (
  <>
    {title}{' '}
    <Tooltip content={helpContent}>
      <Button variant={ButtonVariant.plain} className="pf-v5-u-px-xs">
        <Icon size="md">
          <HelpIcon />
        </Icon>
      </Button>
    </Tooltip>
  </>
);

export default TabTitle;
