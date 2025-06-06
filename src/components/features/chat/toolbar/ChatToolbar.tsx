import { FC, memo, useState } from "react";

import { Button } from "@/components/ui/common/Button";

interface ChatToolbarProp {
  messageIds?: string[];
  clearMessageIds: () => void;
}

const ChatToolbar: FC<ChatToolbarProp> = ({ messageIds, clearMessageIds }) => {
  return (
    <div>
      {messageIds && messageIds.length > 0 && (
        <div className="flex items-center justify-end space-x-5 rounded-lg">
          <Button onClick={clearMessageIds} className="" variant="default">
            Clear Selection
          </Button>
          <span className="text-sm">
            {`message(s) selected: ${messageIds.length}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(ChatToolbar);
