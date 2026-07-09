const dns = require('dns');
const { Resolver } = require('dns').promises;
const mongoose = require('mongoose');

// Fixes common Windows/Node DNS issues with mongodb+srv
dns.setDefaultResultOrder('ipv4first');

const PUBLIC_DNS = ['1.1.1.1', '8.8.8.8'];

function parseSrvUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return null;

  return {
    credentials: match[1],
    clusterHost: match[2],
    dbPath: match[3] || '/TaskPro',
    query: match[4] || '?retryWrites=true&w=majority',
  };
}

async function resolveSrvHosts(clusterHost) {
  const resolver = new Resolver();
  resolver.setServers(PUBLIC_DNS);
  return resolver.resolveSrv(`_mongodb._tcp.${clusterHost}`);
}

async function srvToStandardUri(srvUri) {
  const parsed = parseSrvUri(srvUri);
  if (!parsed) return srvUri;

  const records = await resolveSrvHosts(parsed.clusterHost);
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(',');

  const params = new URLSearchParams(parsed.query.replace(/^\?/, ''));
  params.set('ssl', 'true');
  params.set('authSource', 'admin');

  return `mongodb://${parsed.credentials}@${hosts}${parsed.dbPath}?${params.toString()}`;
}

async function resolveMongoUri(uri) {
  if (process.env.MONGO_URI_STANDARD) {
    return process.env.MONGO_URI_STANDARD;
  }

  if (!String(uri).startsWith('mongodb+srv://')) {
    return uri;
  }

  return srvToStandardUri(uri);
}

async function connectDatabase() {
  const rawUri = process.env.MONGO_URI;

  if (!rawUri) {
    throw new Error('MONGO_URI is missing in .env file');
  }

  let uri = rawUri;

  try {
    uri = await resolveMongoUri(rawUri);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });

    console.log(' MongoDB Connected Successfully');
  } catch (error) {
    console.error(' MongoDB Connection Error:', error.message);

    if (String(rawUri).startsWith('mongodb+srv://') && !process.env.MONGO_URI_STANDARD) {
      console.error('\nTip: SRV DNS lookup failed. You can also paste the standard connection string from Atlas:');
      console.error('  Atlas → Connect → Drivers → "Standard connection string"');
      console.error('  Put it in .env as MONGO_URI_STANDARD=...\n');
    }

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('Tip: Check Database Access username/password in Atlas and URL-encode special characters in the password.');
    }

    if (error.message.includes('timed out') || error.message.includes('ETIMEDOUT')) {
      console.error('Tip: In Atlas → Network Access, add your IP or use 0.0.0.0/0 for development.');
    }

    process.exit(1);
  }
}

module.exports = connectDatabase;
