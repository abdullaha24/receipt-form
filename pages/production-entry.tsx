import Head from "next/head";
import EntryForm from "../components/EntryForm";

export default function ProductionEntry() {
  return (
    <>
      <Head>
        <title>Production Entry | Factory Entry System</title>
        <meta name="description" content="Form for recording daily production" />
      </Head>
      <EntryForm title="Production Entry" type="production" />
    </>
  );
}
