import Head from "next/head";
import EntryForm from "../components/EntryForm";

export default function Receipt() {
  return (
    <>
      <Head>
        <title>Material Receipt | Factory Entry System</title>
        <meta name="description" content="Form for recording material receipts" />
      </Head>
      <EntryForm title="Material Receipt" type="receipt" />
    </>
  );
}
