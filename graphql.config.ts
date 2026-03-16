import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
  schema: "../../backend/src/core/graphql/schema.gql",
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
