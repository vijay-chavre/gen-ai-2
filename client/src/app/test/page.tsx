"use client";

import { useState } from "react";
import { ContentRenderer } from "@/components/ui/content-renderer";
import { TestRenderer } from "@/components/ui/test-renderer";
import { ResponseType } from "@/services/chatService";

export default function TestPage() {
  const [testContent, setTestContent] = useState(
    "Hello, this is a test message!"
  );
  const [testType, setTestType] = useState<ResponseType>("text");

  const testMessages = [
    {
      content: "This is a simple text message",
      type: "text" as ResponseType,
    },
    {
      content: '{"name": "John", "age": 30, "city": "New York"}',
      type: "json" as ResponseType,
    },
    {
      content:
        "```javascript\nfunction hello() {\n  console.log('Hello World!');\n}\n```",
      type: "code" as ResponseType,
    },
    {
      content:
        "# Hello\nThis is a **markdown** message with:\n- List item 1\n- List item 2\n\n`Inline code` here",
      type: "markdown" as ResponseType,
    },
    {
      content: `Here is a simple JavaScript function that swaps the values of two variables:
\`\`\`javascript
function swap(a, b) {
  let temp = a;
  a = b;
  b = temp;
  return [a, b];
}
\`\`\`
You can use it like this:
\`\`\`javascript
let x = 5;
let y = 10;
console.log("Before swap: x =", x, "y =", y);
[x, y] = swap(x, y);
console.log("After swap: x =", x, "y =", y);
\`\`\`
This will output:
\`\`\`
Before swap: x = 5 y = 10
After swap: x = 10 y = 5
\`\`\`
Alternatively, you can use destructuring assignment to swap variables in a single line:
\`\`\`javascript
let x = 5;
let y = 10;
[x, y] = [y, x];
console.log("After swap: x =", x, "y =", y);
\`\`\`
This is a more concise and modern way to swap variables in JavaScript.`,
      type: "mixed" as ResponseType,
    },
    {
      content: `CODE

Here's a simple table with some dummy data:

| **Name** | **Age** | **City** | **Occupation** |
| --- | --- | --- | --- |
| John Smith | 25 | New York | Software Engineer |
| Jane Doe | 30 | Los Angeles | Marketing Manager |
| Bob Brown | 35 | Chicago | Doctor |
| Alice Johnson | 20 | Houston | Student |
| Mike Davis | 40 | Miami | Lawyer |

Let me know if you'd like me to generate more data or change the columns!
CODE`,
      type: "mixed" as ResponseType,
    },
    {
      content: `| Name | Age | City | Occupation |
|------|-----|------|------------|
| John | 25 | New York | Developer |
| Jane | 30 | San Francisco | Designer |
| Bob | 35 | Chicago | Manager |
| Alice | 28 | Boston | Engineer |`,
      type: "mixed" as ResponseType,
    },
    {
      content: `Programming Languages:
1. JavaScript - Web development
2. Python - Data science and AI
3. Java - Enterprise applications
4. C++ - System programming
5. Go - Cloud and microservices

Frameworks:
- React - Frontend development
- Node.js - Backend development
- Django - Python web framework
- Spring - Java framework
- Express - Node.js framework`,
      type: "mixed" as ResponseType,
    },
    {
      content: `Name\tAge\tCity\tOccupation
John\t25\tNew York\tDeveloper
Jane\t30\tSan Francisco\tDesigner
Bob\t35\tChicago\tManager
Alice\t28\tBoston\tEngineer`,
      type: "mixed" as ResponseType,
    },
  ];

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Content Renderer Test</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Input</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content:</label>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                className="w-full h-32 p-3 border rounded-md"
                placeholder="Enter test content..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Response Type:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as ResponseType)}
                className="w-full p-2 border rounded-md"
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
                <option value="code">Code</option>
                <option value="markdown">Markdown</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Test Renderer (Simple)</h2>
          <TestRenderer content={testContent} responseType={testType} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Content Renderer (Advanced)
          </h2>
          <ContentRenderer content={testContent} responseType={testType} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Auto-Detection Test</h2>
          <p className="text-sm text-gray-600 mb-2">
            This tests the auto-detection logic without specifying a response
            type:
          </p>
          <ContentRenderer content={testContent} responseType="mixed" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            HTML Table Rendering Test
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            This shows how tables are rendered as proper HTML table elements:
          </p>
          <ContentRenderer
            content={`Here's a simple table with some dummy data:

| **Name** | **Age** | **City** | **Occupation** |
| --- | --- | --- | --- |
| John Smith | 25 | New York | Software Engineer |
| Jane Doe | 30 | Los Angeles | Marketing Manager |
| Bob Brown | 35 | Chicago | Doctor |
| Alice Johnson | 20 | Houston | Student |
| Mike Davis | 40 | Miami | Lawyer |

Let me know if you'd like me to generate more data or change the columns!`}
            responseType="mixed"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Predefined Test Cases</h2>
          <div className="space-y-6">
            {testMessages.map((msg, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  Test Case {index + 1}: {msg.type.toUpperCase()}
                </h3>
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  {msg.content}
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Rendered Output:</h4>
                  <ContentRenderer
                    content={msg.content}
                    responseType={msg.type}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
