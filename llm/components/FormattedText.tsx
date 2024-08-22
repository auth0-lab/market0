import Markdown from "react-markdown";

export const FormattedText = ({content} : { content: string}) => {
  return <Markdown className="markdown">{content}</Markdown>;
};
