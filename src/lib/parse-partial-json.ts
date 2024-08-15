// import SecureJSON from 'secure-json-parse'

import { fixJson } from './fix-json'

// export function parsePartialJson(jsonText: string | undefined): unknown | undefined {
//   if (jsonText == null) {
//     return undefined
//   }

//   try {
//     // first attempt a regular JSON parse:
//     return SecureJSON.parse(jsonText)
//   } catch (ignored) {
//     try {
//       // then try to fix the partial JSON and parse it:
//       const fixedJsonText = fixJson(jsonText)
//       return SecureJSON.parse(fixedJsonText)
//     } catch (ignored) {
//       // ignored

//       // 使用更准确的正则表达式，匹配大括号之间的所有内容
//       const jsonString = jsonText.match(/\{[\s\S]*\}/);

//       // 如果匹配到了 JSON 字符串，先处理转义字符，然后使用 JSON.parse 解析它
//       if (jsonString) {
//           try {
//               // 将 JSON 字符串中的转义字符还原
//               const cleanedJsonString = jsonString[0].replace(/\\n/g, '\n').replace(/\\"/g, '"');

//               // 解析为 JSON 对象
//               const jsonObject = JSON.parse(cleanedJsonString);
//               console.log(jsonObject);  // 输出 JSON 对象
//               return jsonObject
//           } catch (error) {
//               console.error('解析 JSON 时发生错误:', error);
//           }
//       } else {
//           console.log('没有找到 JSON 对象');
//       }

//     }
//   }

//   return undefined
// }

export function parsePartialJson(jsonText: string | undefined): unknown | undefined {
  if (!jsonText) {
    return undefined
  }

  // 使用正则表达式匹配并提取 JSON 对象部分
  const jsonString = jsonText.match(/(\{(?:[^{}]|(?:\{[^{}]*\}))*\})/)

  if (!jsonString) {
    console.log('没有找到 JSON 对象')
    return undefined
  } else {
    console.log('jsonString', jsonString)
  }

  // 将 JSON 字符串中的转义字符还原
  const cleanedJsonString = jsonString[0].replace(/\\n/g, '\n').replace(/\\"/g, '"')
  try {
    // 解析为 JSON 对象
    const jsonObject = JSON.parse(cleanedJsonString)
    return jsonObject // 返回解析后的 JSON 对象
  } catch (error) {
    console.error('解析 JSON 时发生错误:', error)

    // 尝试修复并重新解析
    try {
      const fixedJsonText = fixJson(cleanedJsonString) // 假设 fixJson 是一个你自定义的修复函数
      return JSON.parse(fixedJsonText)
    } catch (ignoredError) {
      console.error('修复 JSON 后解析仍然失败:', ignoredError)
    }
  }

  return undefined
}
