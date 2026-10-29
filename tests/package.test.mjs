import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (name) => readFileSync(join(root, name), 'utf8')
const manifest = JSON.parse(read('package.json'))
const patch = read('cordis.patch.yml')
const client = read('client.js')
const index = JSON.parse(read('market/index.json'))

test('package identity is publishable and self-consistent', () => {
  assert.equal(manifest.name, 'dsh-cost-balance-chip')
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.license, 'MIT')
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
  assert.match(manifest.engines.dsh, /0\.2\.1/)
  assert.equal(manifest.publishConfig.access, 'public')
})

test('bundle patch names the same package and row', () => {
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.match(patch, /id: cost-balance-chip/)
  assert.match(patch, /name: 'dsh-cost-balance-chip'/)
  assert.doesNotMatch(patch, /@local\//)
})

test('client bundle registers the package id and required slots', () => {
  assert.match(client, /id: 'dsh-cost-balance-chip'/)
  assert.match(client, /conversation\.input\.right/)
  assert.match(client, /remote\.account/)
  assert.doesNotMatch(client, /@local\/session-cost-meter/)
  assert.equal(manifest.exports['./client'], './client.js')
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-conversation'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-locale'))
})

test('public files exist and the README documents installation', () => {
  for (const file of manifest.files) {
    if (file.includes('*')) continue
    assert.ok(existsSync(join(root, file)), `missing ${file}`)
  }
  assert.ok(existsSync(join(root, 'README.md')))
  assert.ok(existsSync(join(root, 'LICENSE')))
  assert.match(read('README.md'), /dsh plugin --profile <profile> add dsh-cost-balance-chip/)
})

test('market index points at this exact release', () => {
  assert.equal(index.format, 1)
  assert.equal(index.title.en.length > 0, true)
  assert.equal(index.plugins.length, 1)
  const plugin = index.plugins[0]
  assert.equal(plugin.name, manifest.name)
  assert.equal(plugin.versions.length, 1)
  assert.equal(plugin.versions[0].version, manifest.version)
  assert.equal(plugin.versions[0].source.type, 'npm')
  assert.equal(plugin.versions[0].engines.dsh, manifest.engines.dsh)
  assert.ok(existsSync(join(root, 'market', plugin.icon)))
})
