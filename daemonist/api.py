import os
import json
import requests


def parse_list(flattened):
  print(flattened[0])
  docmap = dict([f['id'], f] for f in flattened)
  print(docmap)


class DynalistAPI():
  def __init__(self, api_token=None):
    if api_token is None:
      self.api_token = os.environ['DYNALIST_API_TOKEN']
    assert self.api_token is not None, 'No API key provided!'

  def get_list(self):
    flattened = self._post_json("https://dynalist.io/api/v1/file/list")
    return parse_list(flattened['files'])

  def _post_json(self, url):
    response = requests.post(url, json={
        'token': self.api_token
    })
    if response.status_code != requests.codes['ok']:
      raise Exception("Network request to %s failed." % url)
    content = response.json()
    if content['_code'] != 'Ok':
      raise Exception("API call to %s failed: %s" % (url, content['_msg']))
    return content
