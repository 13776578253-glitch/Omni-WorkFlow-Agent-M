import os
from dotenv import load_dotenv
from langchain_deepseek import ChatDeepSeek
from langchain_core.messages import SystemMessage, HumanMessage


class DeepseekModel:
    def __init__(self, temperature=0.7):
        load_dotenv()
        self.llm = ChatDeepSeek(
            model="deepseek-chat", 
            api_key=os.getenv("DEEPSEEK_API_KEY"), 
            temperature=temperature
        )
        self.chat_history = []

    def question(self, s_msg, h_msg):
        system_msg = SystemMessage(content=s_msg)
        human_msg = HumanMessage(content=h_msg)
        
        self.chat_history.append(("用户", h_msg))
        result = self.llm.invoke([system_msg, human_msg])
        self.chat_history.append(("AI", result.content))
        
        return result

# class deepseek_embedding:
#     def __init__(self):
#         load_dotenv()
#         self.embedding_client = OpenAI(api_key=os.environ["DEEPSEEK_API_KEY"], base_url="https://api.deepseek.com")

#     def get_embedding(self, text, model="text-embedding-3"):
#         """生成文本嵌入向量"""
#         response = self.embedding_client.embeddings.create(
#             model=model,
#             input=text
#         )
#         return response.data[0].embedding


def main():
    a = DeepseekModel()
    s_msg = ''
    h_msg = '我的账号是什么'
    b = a.question(s_msg, h_msg)
    print(b)


if __name__ == "__main__":
    main()
