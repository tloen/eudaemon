from api import DynalistAPI


class DynalistSession():
  def __init__(self):
    self.api = DynalistAPI()
    files = self.api.get_list()
    print(files)


if __name__ == "__main__":
  sess = DynalistSession()
