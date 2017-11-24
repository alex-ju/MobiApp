import pandas as pd
import re


def replace_char(s, chars, replacement):
    for c in chars:
        s = s.replace(c, replacement)
    return s


def create_alphabet():
    a = pd.read_csv('alphabet.csv', header=None, index_col=0, squeeze=True)
    return a


def unify_pageviews(seq_strings, alphabet):
    pageview_chars = []

    for name, c in alphabet.items():
        if 'pv_' in name:
            pageview_chars.append(c)

    pageview_c = alphabet['pageview']
    strings = seq_strings.apply(lambda s: replace_char(s, chars=pageview_chars, replacement=pageview_c))
    return strings


def create_pv_entry(pv_dict, pv_list, char, alphabet):
    for pv in pv_list:
        pv_dict[alphabet[pv]] = char

    return pv_dict


def create_pv_dict(alphabet):
    groups = {}
    groups['account_group'] = ['pv_account', 'pv_signin', 'pv_register', 'pv_eliterewards']
    groups['cart_group'] = ['pv_cart']
    groups['checkout_group'] = ['pv_checkout', 'pv_confirmation']
    groups['browse_group'] = ['pv_pdp', 'pv_home', 'pv_plp',  'pv_search', 'pv_explore', 'pv_specialoffers']
    groups['other_group'] = ['pv_other']
    groups['info_group'] = ['pv_storeLocator', 'pv_policy', 'pv_other_info']

    rep = {}
    o = ord('c')
    for name, g in groups.items():
        if name not in alphabet.keys():
            while chr(o) in alphabet.values():
                o = o+1
            alphabet[name] = chr(o)
            o = o + 1
        char = alphabet[name]
        rep = create_pv_entry(rep, g, char, alphabet)

    return rep


def group_pageviews(s, pv_dict):
    chars = set(list(s))
    for c in chars:
        if c in pv_dict:
            s = re.sub(c, pv_dict[c], s)

    return s


def create_preprocess_cols(all_seqs, alphabet):
    # all_seqs['duration'] = all_seqs.apply(lambda s: s.end - s.start, axis=1) 
    # all_seqs[pages] = all_seqs[pages].apply(lambda s: replace_char(s, alphabet['pv_search'], alphabet['pv_category']))
    all_seqs[actions] = unify_pageviews(all_seqs[pages], alphabet)

    pv_dict = create_pv_dict(alphabet)
    all_seqs[pages_grouped] = all_seqs[pages].apply(lambda s: group_pageviews(s, pv_dict))
    print('adding LENGTH COLUMN')
    all_seqs['len'] = all_seqs[pages].apply(len)


pages = 'action_strings'
actions = 'general_actions'
pages_grouped = 'pages_grouped'
