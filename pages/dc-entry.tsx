import Head from "next/head";
import EntryForm from "../components/EntryForm";

export default function DcEntry() {
  return (
    <>
      <Head>
        <title>DC Entry | Factory Entry System</title>
        <meta name="description" content="Form for recording delivery challan entries" />
      </Head>
      <EntryForm title="DC Entry" type="dc-entry" />
    </>
  );
}
