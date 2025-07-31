import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import { readFileSync } from 'fs';
import cors from 'cors';
import bodyparser from 'body-parser';

// Load schema
const schema = buildSchema(readFileSync('merged-schema.graphql', 'utf8'));

// Root resolvers
const rootValue = {
  hello: ({ name }) => `yo ${name ?? 'world'} 👋`
};

// Setup express
const app = express();
app.use(cors());
app.use(bodyparser.json());
app.all('/graphql', createHandler({ schema, rootValue }));

app.get('/', (_, res) => {
  res.send(`
    <html>
      <head><title>GraphiQL</title></head>
      <body>
        <div id="graphiql" style="height: 100vh;"></div>
        <script
          crossorigin
          src="https://unpkg.com/react/umd/react.production.min.js"></script>
        <script
          crossorigin
          src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
        <script
          src="https://unpkg.com/graphiql/graphiql.min.js"></script>
        <script>
          const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher }),
            document.body
          );
        </script>
      </body>
    </html>
  `);
});

app.listen(4000, () => {
  console.log('Server running at http://localhost:4000');
});
