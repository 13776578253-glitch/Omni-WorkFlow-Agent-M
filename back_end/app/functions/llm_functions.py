import logging, re
from app.functions.llm.ollama_model import GeminiModel
from app.functions.llm.deepseek_model import DeepseekModel
from app.functions.llm.spark_model import SparkModel
from app.functions.llm_prompt.ppt_prompt import PPT_PROMPT
from app.functions.llm_prompt.pdf_prompt import PDF_PROMPT


class ModelFunction:
    logger = logging.getLogger("llm_functions")
    MODEL_DICT = {
        'ollama-gemma3': GeminiModel,
        'deepseek-r1': DeepseekModel,
        'spark': SparkModel
    }

    @classmethod
    def match_content(cls, content):
        print(content)
        try:
            # 优先匹配代码块 ```xxx ... ```
            pattern = r"```(?:json|html)?\s*([\s\S]*?)\s*```"
            match = re.search(pattern, content, re.IGNORECASE)
            if match: return match.group(1).strip()

            # 匹配 JSON 数组或对象
            # pattern_json = r"(\{[\s\S]*?\}|\[[\s\S]*?\])"
            # match = re.search(pattern_json, content)
            # if match: return match.group(1).strip()

            cls.logger.info("未匹配到内容")
            return content

        except Exception as e:
            cls.logger.error(f"匹配失败: {e}")
            return content

    @classmethod
    def get_model(cls, model_type):
        if model_type not in cls.MODEL_DICT.keys():
            cls.logger.error(f"模型{model_type}不存在")
            return None
        model = cls.MODEL_DICT[model_type]()

        cls.logger.info(f"成功拉取模型{model_type}")
        return model
    
    @classmethod
    def model_question(cls, model, s_msg, h_msg):
        if model is None: return None
        model_result = model.question(s_msg, h_msg)
        matched_content = cls.match_content(model_result.content)
        return matched_content
    
    @classmethod
    def ppt_model(cls, h_msg, model=None, model_type='ollama-gemma3'):
        cls.logger.info("ppt_prompt")
        if model is None: model = cls.get_model(model_type)
        result = cls.model_question(model, PPT_PROMPT, h_msg)
        return result

    @classmethod
    def pdf_model(cls, h_msg, model=None, model_type='ollama-gemma3'):
        cls.logger.info("pdf_prompt")
        if model: model = cls.get_model(model_type)
        result = cls.model_question(model, PDF_PROMPT, h_msg)
        return result
    
    @classmethod
    def model_gt(cls, model_type, s_msg, h_msg):
        model = cls.get_model(model_type)
        result = cls.model_question(model, s_msg, h_msg)
        return result



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    h_msg = '帮我生成一个关于新手该怎么入门react的ppt'
    a = ModelFunction.model_gt('deepseek-r1', PPT_PROMPT, h_msg)
    print(a)
    from functions.file_functions import FileFunction
    FileFunction.ppt_function(a, if_write=True)