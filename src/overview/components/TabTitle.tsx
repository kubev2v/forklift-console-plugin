import { Button, ButtonVariant, Icon, Tooltip } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const TabTitle = ({ helpContent, title }: { helpContent: string; title: string }) => (
  <>
    {title}{' '}
    <Tooltip content={helpContent}>
      <Button
        icon={
          <Icon size="md">
            <HelpIcon />
          </Icon>
        }
        variant={ButtonVariant.plain}
        className="pf-v6-u-px-xs"
      />
    </Tooltip>
  </>
);

export default TabTitle;
