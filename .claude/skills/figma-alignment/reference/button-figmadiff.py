# Reference copy of the variant-by-variant diff of an earlier step-by-step pull request, step 13 (run from the repository root).
# Button-specific (parts container / label, emphasis × intent × state): copy it to build/review/tools/ and adapt.
# Step 13: Figma Button variants against the repository's resolved light values (medium, no icon + icon only).
import json, sys
exp = json.load(open('raw_content/components/button-variants-raw.json'))
STATES = ['default','hover','active','disabled']
def leaves(node, path=()):
    if isinstance(node, dict) and '$value' in node: yield path, node
    elif isinstance(node, dict):
        for k, c in node.items():
            if not k.startswith('$'): yield from leaves(c, path + (k,))
def pick(tree, emph, intent, state):
    best = None
    for st in ([state, 'default'] if state != 'default' else ['default']):
        for path, n in leaves(tree):
            keys = set(path)
            states_in = keys & set(STATES)
            if states_in and states_in != {st}: continue
            if not keys - set(STATES) <= {emph, intent}: continue
            if not states_in and st != 'default' and best: pass
            score = len(path) + (1 if states_in else 0)
            if best is None or score > best[0]: best = (score, n)
        if best and any(s in STATES for s in []): break
        # prefer a token naming the state; otherwise fall back to default
        named = [n for p, n in leaves(tree) if st in p and set(p) - set(STATES) <= {emph, intent}]
        if named: break
    return best[1] if best else None
def hexa(n):
    v = n['$value']; a = v.get('alpha', 1)
    if a == 0: return '—'
    h = v.get('hex') or '#' + ''.join(f'{round(c*255):02X}' for c in v['components'])
    return h.upper()[:7] + ('' if a == 1 else f' @{round(a*100)}%')
def alias(n):
    # The alias the token build records in the token's own $extensions entry, whatever its key.
    return n and next((x['alias'] for x in n.get('$extensions', {}).values() if isinstance(x, dict) and 'alias' in x), None)
def run(mode):
    t = json.load(open(f'packages/tokens/dist/platforms/ios/{mode}.tokens.json'))['button']
    return t
t = run('light')
def solid(ps):
    ps = [p for p in (ps or []) if p.get('visible', True) and p['type'] == 'SOLID']
    if not ps: return '—'
    p = ps[0]; o = p.get('opacity', 1)
    return p['color'].upper() + ('' if o == 1 else f' @{round(o*100)}%')
def dist(a, b):
    if a == '—' or b == '—' or '@' in a or '@' in b: return 0 if a == b else 99
    x = [int(a[i:i+2], 16) for i in (1,3,5)]; y = [int(b[i:i+2], 16) for i in (1,3,5)]
    return max(abs(p-q) for p, q in zip(x, y))
rows = []
for v in exp['variants']:
    p = v['variantProperties']
    if p['size'] != 'medium' or p['icon'] != 'none' or p['state'] == 'focus': continue
    e, i, s = p['emphasis'], p['intent'], p['state']
    txt = next(c for c in v['children'] if c['type'] == 'TEXT')
    fig = {'fill': solid(v['fills']), 'border': solid(v['strokes']), 'label': solid(txt['fills'])}
    bg = pick(t['container']['background'], e, i, s); bc = pick(t['container']['border-color'], e, i, s); lc = pick(t['label']['color'], e, i, s)
    today = {'fill': hexa(bg) if bg else '—', 'border': hexa(bc) if bc else '—', 'label': hexa(lc) if lc else '—'}
    al = {'fill': alias(bg), 'border': alias(bc), 'label': alias(lc)}
    for k in fig:
        d = dist(fig[k], today[k])
        if d > 3: rows.append((e, i, s, k, fig[k], today[k], al[k]))
order = {x: n for n, x in enumerate(['accent','subtle','ghost','neutral','brand','error'] + STATES)}
for r in sorted(rows, key=lambda r: (order[r[0]], order[r[1]], order[r[2]], r[3])): print(' | '.join(str(x) for x in r))

print('\n# border ladders: emphasis intent | Figma default/hover/active | repo')
by = {}
for v in exp['variants']:
    p = v['variantProperties']
    if p['size'] != 'medium' or p['icon'] != 'none' or p['state'] not in ('default','hover','active'): continue
    e, i, s = p['emphasis'], p['intent'], p['state']
    bc = pick(t['container']['border-color'], e, i, s); bg = pick(t['container']['background'], e, i, s)
    by.setdefault((e, i), {})[s] = (solid(v['strokes']), hexa(bc) if bc else '—', alias(bc), solid(v['fills']), hexa(bg) if bg else '—', alias(bg))
for (e, i), d in sorted(by.items(), key=lambda x: (order[x[0][0]], order[x[0][1]])):
    print(f"{e} {i} | border fig {' / '.join(d[s][0] for s in ('default','hover','active'))} | repo {' / '.join(d[s][1] for s in ('default','hover','active'))} | {' / '.join(str(d[s][2]) for s in ('default','hover','active'))}")
    print(f"{e} {i} | fill   fig {' / '.join(d[s][3] for s in ('default','hover','active'))} | repo {' / '.join(d[s][4] for s in ('default','hover','active'))} | {' / '.join(str(d[s][5]) for s in ('default','hover','active'))}")
