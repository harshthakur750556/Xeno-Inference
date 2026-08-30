import React, { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { UnifiedThinkingView } from "../thinking/UnifiedThinkingView";

export const LiveExecutionDAG: React.FC = () => {
  return <UnifiedThinkingView />;
};
