import type { Meta, StoryFn } from "@storybook/react";
import { Chessboard } from "./chessboard";

export default {
  title: "App/Chessboard",
  component: Chessboard,
  parameters: {
    layout: "fullscreen",
  },
  args: { tilesPerRow: 8, tilesPerColumn: 8, pieceCount: 5 },
} satisfies Meta<typeof Chessboard>;

const Template: StoryFn<typeof Chessboard> = (args) => {
  return <Chessboard {...args} />;
};

export const Default = Template.bind({});
