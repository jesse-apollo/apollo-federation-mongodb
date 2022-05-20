import json, re, sys
from os.path import exists

DATA_DICT = {
    'APOLLO_KEY':'',
    'APOLLO_GRAPH_REF':'',
    'VARIANT_NAME':'current',
    'GRAPH_ID':'',
    'ROUTING_URL':'',
    'GOOGLE_PROJECT': '',
    'SUBGRAPH1_SUBGRAPH_NAME':'airports',
    'SUBGRAPH2_SUBGRAPH_NAME':'airport-delay',
    'SUBGRAPH3_SUBGRAPH_NAME':'registration',
    'SUBGRAPH1_ROUTING_URL': '',
    'SUBGRAPH2_ROUTING_URL': '',
    'SUBGRAPH3_ROUTING_URL': '',
    'MONGODB_CONN': ''
}

DOT_RE = re.compile('(.+)=(.*)' )
GOOGLE_RE = re.compile('(<CHANGE_ME>)')

# prompt should not include trailing ":"
def ask_input(prompt, default):
    if default != "":
        result = input(prompt + " (%s): " % default)
        if result == "":
            result = default
    else:
        result = input(prompt + ": ")

    return result

def replace_re(m, filename):
    key = m.group(1)
    value = DATA_DICT.get(key, '')
    if key in ['ROUTING_URL', 'SUBGRAPH_NAME']:
        if 'subgraph1' in filename:
            value = DATA_DICT.get('SUBGRAPH1_' + key, '')
        if 'subgraph2' in filename:
            value = DATA_DICT.get('SUBGRAPH2_' + key, '')
        if 'subgraph3' in filename:
            value = DATA_DICT.get('SUBGRAPH3_' + key, '')
        if 'subgraph4' in filename:
            value = DATA_DICT.get('SUBGRAPH4_' + key, '')
    return "%s=%s" % (key, value)

# replace contents of the dot file
def replace_dot(filename):
    file_contents = open(filename).read()
    file_contents = DOT_RE.sub(lambda m: replace_re(m, filename), file_contents)
    open(filename, 'w').write(file_contents)

def replace_google_yaml(filename):
    project = DATA_DICT.get("GOOGLE_PROJECT")
    if project is None:
        return
    file_contents = open("%s.tmpl" % filename).read()
    file_contents = GOOGLE_RE.sub(project, file_contents)
    open(filename, 'w').write(file_contents)


if __name__ == "__main__":

    print("---------------------------")
    print("SE Demo Setup")
    print("---------------------------")
    print("Press Control-C to exit.\n")

    if not exists("gateway/.env") or not exists("gateway/cloudbuild.yaml.tmpl"):
        print("ERROR: dependencies are missing, run 'make install-deps'.")
        sys.exit(1)

    try:
        data = json.loads(open('.config').read())
        for k, v in data.items():
            DATA_DICT[k] = v
    except:
        pass
    else:
        print("Press enter to accept any default/existing values in parenthesis.")


    DATA_DICT['APOLLO_KEY'] = ask_input("Enter your Apollo Studio Graph API Key", DATA_DICT.get('APOLLO_KEY', ''))
    DATA_DICT['GRAPH_ID'] = ask_input("Enter the Graph ID, it is found in Studio under settings", DATA_DICT.get('GRAPH_ID', ''))
    DATA_DICT['VARIANT_NAME'] = ask_input("Enter the Graph Variant to publish to", DATA_DICT.get('VARIANT_NAME', ''))
    DATA_DICT['GOOGLE_PROJECT'] = ask_input("Enter your Google Cloud Project ID", DATA_DICT.get('GOOGLE_PROJECT', ''))
    DATA_DICT['APOLLO_GRAPH_REF'] = "%s@%s" % (DATA_DICT['GRAPH_ID'], DATA_DICT['VARIANT_NAME'])
    DATA_DICT['MONGODB_CONN'] = ask_input("Enter your MongoDB connection string", DATA_DICT.get('MONGODB_CONN', ''))

    print("\nSubgraph Names\nIf you customize your demo, you can change these.  Or keep the defaults.\n")
    DATA_DICT['SUBGRAPH1_SUBGRAPH_NAME'] = ask_input("Subgraph 1 Name", DATA_DICT.get('SUBGRAPH1_SUBGRAPH_NAME', ''))
    DATA_DICT['SUBGRAPH2_SUBGRAPH_NAME'] = ask_input("Subgraph 2 Name", DATA_DICT.get('SUBGRAPH2_SUBGRAPH_NAME', ''))
    DATA_DICT['SUBGRAPH3_SUBGRAPH_NAME'] = ask_input("Subgraph 3 Name", DATA_DICT.get('SUBGRAPH3_SUBGRAPH_NAME', ''))

    print("\nSubgraph URLs\nYou will not have these until you do a deploy.  Just press enter to skip.\n")
    DATA_DICT['SUBGRAPH1_ROUTING_URL'] = ask_input("Subgraph 1 URL", DATA_DICT.get('SUBGRAPH1_ROUTING_URL', ''))
    DATA_DICT['SUBGRAPH2_ROUTING_URL'] = ask_input("Subgraph 2 URL", DATA_DICT.get('SUBGRAPH2_ROUTING_URL', ''))
    DATA_DICT['SUBGRAPH3_ROUTING_URL'] = ask_input("Subgraph 3 URL", DATA_DICT.get('SUBGRAPH3_ROUTING_URL', ''))

    #print(DATA_DICT)

    open(".config", "w").write(json.dumps(DATA_DICT))

    # Now change files
    replace_dot('subgraph1/.env')
    replace_dot('subgraph2/.env')
    replace_dot('subgraph3/.env')
    replace_dot('gateway/.env')
    replace_dot('client/.env')

    replace_google_yaml('gateway/cloudbuild.yaml')
    replace_google_yaml('subgraph1/cloudbuild.yaml')
    replace_google_yaml('subgraph2/cloudbuild.yaml')
    replace_google_yaml('subgraph3/cloudbuild.yaml')
