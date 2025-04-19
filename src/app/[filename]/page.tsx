import { redirect } from "next/navigation";

interface FilenamePage {
  params: {
    filename: string;
  };
}

export default function FilenamePage({ params }: FilenamePage) {
  const { filename } = params;

  redirect(`/share/${filename}`);
}
