import type { Meta, StoryObj } from "@storybook/react";
import { Chessboard } from "./chessboard";

const meta = {
  title: "App/Chessboard",
  component: Chessboard,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Chessboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {};
