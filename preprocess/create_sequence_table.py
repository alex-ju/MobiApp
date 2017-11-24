import pandas as pd
import preprocess_data as prep
import time
import numpy as np


#debenhams
template_groups = {
    'pv_account': ['account', 'accountLocked', 'changePassword', 'forgetpassword', 'emailReminder', 'myBeautyClub', 'mySavedItems'],
    'pv_eliterewards': [],
    'pv_signin': ['login'],
    'pv_register': ['register', 'registerSuccess'],
    'pv_home': ['home'],
    'pv_pdp': ['pdp'],
    'pv_plp': ['plp'],
    'pv_explore': ['brandsAZ', 'category', 'chanelPage', 'contentPage'],
    'pv_search': [],
    'pv_specialoffers': [],
    'pv_cart': ['cart'],
    'pv_checkout': ['checkoutPayment', 'checkoutPaymentProgress','checkoutShipping', 'checkoutSecurePayment'],
    'pv_confirmation': ['checkoutConfirmation'],
    'pv_policy':[],
    'pv_other_info': [],
    'pv_storeLocator': ['find-a-store'],
    'pv_other': []

}

#Lancome
template_groups = {
    'pv_account': ['account', 'profile', 'orderhistory', 'orderdetails', 'favorites', 'addressbook', 'wallet', 'PasswordForgetEmailPage', 'forgetPasswordEmailPage', 'PasswordChangedPage'],
    'pv_eliterewards': ['rewards-catalog', 'rewardsHistory', 'rewards-my-account', 'uploadReceipt', 'abouteliteRewards', 'howToEarnPoints', 'rewardsFaq', 'baRegistration', 'loyalty-terms'],
    'pv_signin': ['signin'],
    'pv_register': ['register'],
    'pv_home': ['home'],
    'pv_pdp': ['productDetailsPage'],
    'pv_plp': ['productListPage'],
    'pv_explore': ['explore', 'magArticle', 'BeautyMagPage', 'BlogAboutPage', 'giftWithPurchase', 'giftLanding', 'giftcertpurchase', 'giftCertificates', 'totalGiftWithPurchase', 'customFoudnation', 'skinCareRoutineFinder', 'skinCareFinder', 'skinCareRoutineFinderResults', 'mascaraFinder', 'VideoDetails', 'video-library', 'VideoGallerySearch'],
    'pv_search': ['searchResultPage', 'notFound'],
    'pv_specialoffers': ['specialOffers', 'specialPromo', 'specialOfferPage', 'stJude', 'singleTC'],
    'pv_cart': ['cart', 'cartEditPage'],
    'pv_checkout': ['checkout'],
    'pv_confirmation': ['checkout-confirmation'],
    'pv_policy':['termsConditions', 'returnPolicy', 'privacyPolicy', 'customerService', 'contact', 'HolidayShipping'],
    'pv_other_info': ['careers', 'socialGallery', 'customEngraving'],
    'pv_storeLocator': ['storeLocator'],
    'pv_other': ['gigyalogin', 'onlineOnly']

}

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





def create_sequence_table(seq_table):
    start = time.time()
    print('Processing {} sequences...'.format(len(seq_table)))
    # seq_table.reset_index(level=0, inplace=True)
    # seq_table.columns = seq_table.columns.droplevel()

    # seq_table = seq_table.reset_index()
    seq_table = seq_table.sort_values(['client_id', 'start'])
    seq_table = seq_table.reset_index()
    del seq_table['index']
    seq_table.reset_index(level=0, inplace=True)
    seq_table = seq_table.set_index('index')

    print('Number of null pages in table: {}'.format(len(seq_table[seq_table[pages].isnull()])))
    s = seq_table[~seq_table[pages].isnull()]
    prep.create_preprocess_cols(s, alphabet)

    end = time.time()
    print('A total of {} sequences created!'.format(len(s)))
    print('total time to create sequence table: {}'.format(end-start))
    return s



# ------------------------------- PREPROCESSING -----------------------------#

pages = 'action_strings'
actions = 'general_actions'
pages_grouped = 'pages_grouped'


path = 'debenhams/'

# sequence_table_csv = 'debenhams-progressive_2017-10-19_2017-11-20_sampling_1_over_1.csv'
sequence_table_csv = 'debenhams-progressive_2017-10-19_2017-11-22_sampling1_1_over_1.csv' #with myBeautyClub as eliterewards

print('Creating sequence table for: ' + sequence_table_csv)

sequence_table = pd.read_csv(path + sequence_table_csv)


session_table = create_sequence_table(sequence_table)
session_table.to_csv('sequence_table/session_table_' + sequence_table_csv , encoding='utf-8')
