import pandas as pd
import preprocess_data as prep
import time
import numpy as np

template_groups = {
    'pv_account': ['account', 'profile', 'orderhistory', 'orderdetails', 'favorites', 'addressbook', 'wallet'],
    'pv_eliterewards': ['rewards-catalog', 'rewardsHistory', 'rewards-my-account', 'uploadReceipt', 'abouteliteRewards', 'howToEarnPoints', 'rewardsFaq', 'baRegistration', 'loyalty-terms'],
    'pv_signin': ['signin'],
    'pv_register': ['register'],
    'pv_home': ['home'],
    'pv_pdp': ['productDetailsPage'],
    'pv_plp': ['productListPage'],
    'pv_explore': ['explore', 'giftWithPurchase', 'totalGiftWithPurchase', 'customFoudnation', 'skinCareRoutineFinder', 'skinCareRoutineFinderResults', 'mascaraFinder'],
    'pv_search': ['searchResultPage'],
    'pv_specialoffers': ['specialOffers', 'specialPromo', 'specialOfferPage'],
    'pv_cart': ['cart', 'cartEditPage'],
    'pv_checkout': ['checkout'],
    'pv_confirmation': ['checkout-confirmation'],
    'pv_policy':['termsConditions', 'returnPolicy', 'privacyPolicy', 'customerService'],
    'pv_other_info': ['careers', 'socialGallery', 'customEngraving'],
    'pv_storeLocator': ['storeLocator'],
    'pv_other': ['gigyalogin', 'onlineOnly']

}


def create_alphabet(action_table):
    unique_values = action_table.action_type.unique()
    print(unique_values)

    alphabet = {
        "addToCart": 'A',
        "removeFromCart": "R",
        "purchase": "P",
        "search": "S",
        "appDisplayError": "E",
        "appStart": "L",
        "offlineModeUsed": "O",
        "pageview": "v",
        "account_group": "a",
        "browse_group": "b",
        "cart_group": "c",
        "checkout_group": "k",
        "other_group": "w",
        "info_group": "i",
        "pv_home": "h",
        "pv_pdp": "d",
        "pv_plp": "l",
        "pv_search": "f",
        "pv_specialoffers": "o",
        "pv_explore": "x",
        'pv_account': 't',
        'pv_eliterewards': 'e',
        'pv_signin': 'g',
        'pv_register': 'r',
        'pv_cart': 'y',
        'pv_checkout': 'z',
        'pv_confirmation': 'm',
        'pv_policy': 'p',
        'pv_storeLocator': 's',
        'pv_other_info': 'u',
        'pv_other': 'w'
    }

    o = ord('B')
    for v in sorted(unique_values):
        if v not in alphabet.keys():
            while chr(o) in alphabet.values():
                o = o+1
            alphabet[v] = chr(o)
            o = o + 1
    alphabet = pd.Series(alphabet)
    return alphabet


def characterize(seq, alphabet):
    c = ''
    for el in seq:
        c = c + alphabet[el]
    return c


def create_sequence_table(action_table, groups):
    start = time.time()
    print('Processing {} actions...'.format(len(action_table)))
    cust = lambda s: characterize(list(s), alphabet)
    f = {'index': {'start_index': min, 'end_index': max}, 'time': {'start': min, 'end': max}, 'action_type': {'action_strings': cust} }
    s = action_table.groupby(groups).agg(f)
    s.columns = s.columns.droplevel()
    s = s.reset_index()

    if(len(groups) == 2):
        s = s[['client_id', 'session_id', 'action_strings', 'start_index', 'end_index',  'start', 'end']]
    else:
        s = s[['client_id', 'action_strings', 'start_index', 'end_index',  'start', 'end']]

    s = s.sort_values(['client_id', 'start'])
    s = s.reset_index(drop=True)
    s['timeSinceLastSeq'] = np.where(s.client_id == s.client_id.shift(1),
                                     s.start - s.end.shift(1), 0)
    s = s[s.timeSinceLastSeq.astype('timedelta64[s]')>=0]
    end = time.time()
    print('Finished creating initial table in {} seconds. Now starting to add preprocessed columns!'.format(end-start))
    print('Number of null pages in table: {}'.format(len(s[s[pages].isnull()])))
    s = s[~s[pages].isnull()]
    prep.create_preprocess_cols(s, alphabet)
    end = time.time()
    print('A total of {} sequences created!'.format(len(s)))
    print('total time to create sequence table: {}'.format(end-start))
    return s


def create_action_type(row):
    action = row.action
    if action != 'pageview':
        return action
    else:
        template = row.template
        for k, v in template_groups.items():
            if template in v:
                return k

    return None


# ------------------------------- PREPROCESSING -----------------------------#

pages = 'action_strings'
actions = 'general_actions'
pages_grouped = 'pages_grouped'

# action_table_csv = 'action_table_lancome_1709.csv'  # original action table
action_table_csv = 'action_table_09_2017.csv'  # with action_type column

action_table = pd.read_csv(action_table_csv)
action_table = action_table.drop('Unnamed: 0', 1)
action_table['time'] = pd.to_datetime(action_table['time'])
action_table.action = action_table.action.str.strip()
action_table.template = action_table.template.str.strip()

if 'index' not in action_table:
    print('Adding index column')
    action_table.reset_index(level=0, inplace=True)


# action_table['action_type'] = action_table.apply(lambda row: create_action_type(row), axis=1)
# action_table.to_csv('action_table_09_2017.csv', encoding='utf-8')

nulls = action_table.loc[action_table.action_type.isnull()]

if (len(nulls) == 0):

    alphabet = create_alphabet(action_table)
    print(alphabet)
    alphabet.to_csv('alphabet.csv', encoding='utf-8')

    session_table = create_sequence_table(action_table, ['client_id', 'session_id'])
    session_table.to_csv('session_table.csv', encoding='utf-8')

    # client_table = create_sequence_table(action_table, 'client_id')
    # client_table.to_csv('client_table.csv', encoding='utf-8')
