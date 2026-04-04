/**
 * Word Dictionary Module — v3
 * Expanded with longer words, special characters, and code-themed phrases.
 * Words scale dramatically in length across difficulty tiers.
 */

const words = {
  // 2-4 chars
  easy: [
    'run', 'code', 'type', 'fast', 'dash', 'neon', 'glow', 'fire', 'hack',
    'byte', 'loop', 'grid', 'data', 'key', 'node', 'bit', 'net', 'ram',
    'cpu', 'bug', 'log', 'tag', 'api', 'app', 'css', 'dom', 'git', 'hex',
    'url', 'sql', 'map', 'set', 'pop', 'add', 'put', 'get', 'dot',
    'vim', 'tab', 'end', 'new', 'try', 'var', 'let', 'div', 'img', 'box',
    'row', 'col', 'pad', 'top', 'gap', 'max', 'min', 'sum', 'abs',
    'arc', 'ray', 'hub', 'zip', 'web', 'dev', 'ops', 'pro', 'ace', 'aim',
    'axe', 'ban', 'bat', 'bid', 'bow', 'cab', 'cap', 'cup', 'dip', 'dub',
    'flux', 'core', 'void', 'null', 'ping', 'link', 'echo', 'bash',
  ],
  // 5-6 chars
  medium: [
    'cyber', 'pixel', 'stack', 'query', 'debug', 'frame', 'parse', 'fetch',
    'async', 'await', 'yield', 'class', 'array', 'queue', 'cache', 'scope',
    'event', 'state', 'props', 'hooks', 'route', 'proxy', 'build', 'merge',
    'clone', 'patch', 'linux', 'react', 'redux', 'regex', 'token', 'index',
    'table', 'input', 'value', 'error', 'throw', 'catch', 'block', 'super',
    'float', 'break', 'while', 'local', 'cloud', 'crypt', 'drive', 'flash',
    'graph', 'image', 'laser', 'layer', 'modal', 'mutex', 'orbit', 'panel',
    'pivot', 'pulse', 'shift', 'slice', 'spawn', 'surge', 'trace',
    'tuple', 'union', 'vault', 'virus', 'blade', 'boost', 'burst', 'chain',
    'chunk', 'codec', 'delta', 'ember', 'fiber', 'forge', 'glide', 'helix',
    'kernel', 'render', 'server', 'client', 'binary', 'socket', 'stream',
    'engine', 'vector', 'matrix', 'module', 'output', 'deploy', 'signal',
  ],
  // 7-9 chars
  hard: [
    'runtime', 'webpack', 'promise', 'decrypt', 'iterate', 'compile',
    'payload', 'gateway', 'servlet', 'handler', 'express', 'swagger',
    'network', 'backend', 'session', 'trigger', 'cluster', 'encrypt',
    'factory', 'adapter', 'builder', 'command', 'context', 'crawler',
    'decoder', 'dynamic', 'emitter', 'exploit', 'hashing', 'integer',
    'library', 'manager', 'measure', 'message', 'monitor', 'operate',
    'package', 'pointer', 'private', 'process', 'program', 'project',
    'quantum', 'reactor', 'reducer', 'release', 'routing', 'scanner',
    'shallow', 'sitemap', 'snippet', 'storage', 'testing', 'toolkit',
    'upgrade', 'wrapper', 'boolean', 'bracket', 'cascade', 'channel',
    'circuit', 'console', 'convert', 'corrupt', 'cryptic', 'current',
    'database', 'endpoint', 'function', 'generate', 'hardware', 'iterator',
    'mutation', 'pipeline', 'protocol', 'registry', 'resolver', 'security',
    'template', 'viewport', 'compiler', 'debugger', 'engineer', 'firewall',
  ],
  // 9-15 chars — dramatically longer
  extreme: [
    'algorithm', 'benchmark', 'bandwidth', 'container', 'dashboard',
    'debugging', 'generator', 'hypertext', 'injection', 'keystroke',
    'localhost', 'namespace', 'operating', 'parameter', 'processor',
    'recursion', 'rendering', 'scrollbar', 'serialize', 'technique',
    'transform', 'underflow', 'universal', 'webserver', 'cyberpunk',
    'framework', 'interface', 'migration', 'overwrite', 'encryption',
    'polymorphic', 'refactoring', 'scalability', 'transaction',
    'asynchronous', 'architecture', 'infrastructure', 'microservice',
    'optimization', 'parallelism', 'virtualize', 'typescript',
    'javascript', 'kubernetes', 'middleware', 'abstraction',
    'concurrency', 'distributed', 'performance', 'multithreaded',
    'serialization', 'authentication', 'authorization', 'configuration',
    'documentation', 'implementation', 'initialization', 'interpolation',
    'synchronization', 'compatibility', 'vulnerability', 'containerization',
  ],
};

module.exports = words;
