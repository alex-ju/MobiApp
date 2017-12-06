import pandas as pd

pages = 'action_strings'
actions = 'general_actions'

path = 'sequence_table/'
# session_table_csv = 'session_table_debenhams-progressive_2017-10-19_2017-11-20_sampling_1_over_1.csv'
session_table_csv = 'session_table_debenhams-progressive_2017-10-19_2017-11-22_sampling1_1_over_1.csv'
#session_table_csv = 'failedcheckout_session_table_debenhams-progressive_2017-10-19_2017-11-22.csv'
#session_table_csv = 'session_table_debenhams-progressive_2017-10-19_2017-11-22_clientsampling1_1_over_1.csv'
# session_table_csv = 'session_table_17-09-26.csv'
#session_table_csv = 'session_table_lancome_2017-09-01_2017-11-08.csv'
client_table_csv = 'client_table_17-10-13.csv'
table_csv = session_table_csv
session_table = pd.read_csv(path + table_csv)

session_table = session_table.rename(columns={'Unnamed: 0': 'index'})
session_table = session_table.set_index('index')
session_table['start'] = pd.to_datetime(session_table['start'])
session_table['end'] = pd.to_datetime(session_table['end'])
# session_table['duration'] = pd.to_timedelta(session_table['duration'])
# session_table['timeSinceLastSeq'] = pd.to_timedelta(session_table['timeSinceLastSeq'])

# session_table['len'] = session_table[pages].apply(len)

# n = 1650000
n = 1000000
#n =len(session_table)

size = len(session_table.index)
print(size)
print(n)

print('Total actions:')
print(session_table.len.sum())


sample = session_table.iloc[n:]


new_table = session_table.iloc[:n]
# new_table = session_table;

#new_table.to_csv('sample_table/sample_' + str(n) + '_' + table_csv, encoding='utf-8')
