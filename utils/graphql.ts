export const GetLatestUserProfile = `
  query GetLatestUserProfile($owner: String!) {
    transactions(
      owners: [$owner]
      tags: [
        { name: "Data-Protocol", values: ["ao"] }
        { name: "Zone-Type", values: ["User"] }
      ]
      first: 1
      sort: INGESTED_AT_DESC
    ) {
      count
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
          data {
            size
            type
          }
          owner {
            address
          }
          block {
            height
            timestamp
          }
          recipient
        }
      }
    }
  }
`;
