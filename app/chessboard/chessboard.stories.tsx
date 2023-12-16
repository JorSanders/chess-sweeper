import type { Meta, StoryFn } from "@storybook/react";
import { Chessboard } from "./chessboard";

export default {
  title: "App/Chessboard",
  component: Chessboard,
  parameters: {
    layout: "fullscreen",
  },
  args: { itemsPerRow: 8, itemsPerColumn: 8 },
} satisfies Meta<typeof Chessboard>;

const Template: StoryFn<typeof Chessboard> = (args) => {
  return <Chessboard {...args} />;
};

export const Default = Template.bind({});
