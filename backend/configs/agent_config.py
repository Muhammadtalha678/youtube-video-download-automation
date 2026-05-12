from agents import AsyncOpenAI,OpenAIChatCompletionsModel,RunConfig

class AgentConfig:

    def __init__(self,base_url:str,api_key:str,model_name:str):
        self.base_url = base_url
        self.api_key = api_key
        self.model_name = model_name

    def client(self):
        return AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
    
    def model(self):
        return OpenAIChatCompletionsModel(
            model=self.model_name,
            openai_client=self.client()
        )
    
    def config(self):
        return RunConfig(
            model=self.model(),
            model_provider=self.client()
        )