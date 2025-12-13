import Head from "next/head";
import EntryForm from "../components/EntryForm";

export default function Issuance() {
  return (
    <>
      <Head>
        <title>Material Issuance | Factory Entry System</title>
        <meta name="description" content="Form for recording material issuance" />
      </Head>
      <EntryForm title="Material Issuance" type="issuance" />
    </>
  );
}
