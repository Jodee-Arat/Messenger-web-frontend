import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const schema =
  process.env.NEXT_PUBLIC_SERVER_URL ??
  "../../backend/src/core/graphql/schema.gql";

const config: CodegenConfig = {
  schema,
  documents: ["./src/shared/graphql/**/*.graphql"],
  generates: {
    "./src/shared/graphql/generated/output.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
