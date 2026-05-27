import { MDXRemote } from 'next-mdx-remote/rsc';

interface MdxProps {
  source: string;
}

export default function Mdx({ source }: MdxProps) {
  return <MDXRemote source={source} />;
}
