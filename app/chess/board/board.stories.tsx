import type { Meta, StoryFn } from "@storybook/react";
import { Board } from "./board";

export default {
  title: "App/Chessboard",
  component: Board,
  parameters: {
    layout: "fullscreen",
  },
  args: { tilesPerRow: 8, tilesPerColumn: 8, pieceCount: 5 },
} satisfies Meta<typeof Board>;

const Template: StoryFn<typeof Board> = (args) => {
  return <Board {...args} />;
};

export const Default = Template.bind({});
