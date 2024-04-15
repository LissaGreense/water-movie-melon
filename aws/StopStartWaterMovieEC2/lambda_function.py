import boto3
import json
import time

region = 'eu-central-1'
instances = ['i-0e1f6caeb94533030']
ec2 = boto3.client('ec2', region_name=region)

def lambda_handler(event, context):
    
    ensure_instance_running()
    
    return {
    "statusCode": 200,
    "headers": {'Content-Type': 'text/html'},
    "body": get_public_dns()
    }
    
def start_instances():
    try:
        ec2.start_instances(InstanceIds=instances)
        print('Started instances: ' + str(instances))
    except:
        time.sleep(2)
        ensure_instance_running()
    
def get_describe_json():
    filters = [
        {
            'Name': 'instance-id',
            'Values': instances
        } ]
    
    response =  json.dumps(ec2.describe_instances(Filters=filters), default=str)
    response_json = json.loads(response)
    
    return response_json["Reservations"][0]["Instances"][0]
    
def get_public_dns():
    describe_json = get_describe_json()
    
    return describe_json["PublicDnsName"]
    
def get_instance_state():
    describe_json = get_describe_json()

    return describe_json["State"]["Name"]
    
def wait_for_state(state: str):
    while get_instance_state() != state:
        time.sleep(2)
    else:
        return 
    
def ensure_instance_running():

    instance_state = get_instance_state()
    
    if instance_state == "running":
        return
    elif instance_state == "stopped":
        start_instances()
        wait_for_state("running")
        return
    elif instance_state == "stopping":
        wait_for_state("stopped")
        ensure_instance_running()
    else:
        time.sleep(2)
        ensure_instance_running()
        
