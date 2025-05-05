import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KaTeXComponent } from "@/lib/katex";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold gradient-text mb-6">About Zapomint 2.0</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>What is Zapomint?</CardTitle>
            <CardDescription>A modern flashcard application with LaTeX support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Zapomint 2.0 is a powerful flashcard application designed to help students, 
              researchers, and anyone else who needs to memorize complex information, 
              especially those with mathematical notation.
            </p>
            <p>
              Our application allows you to create, edit, and organize flashcards with
              full LaTeX support for mathematical expressions, making it perfect for 
              studying mathematics, physics, engineering, and many other technical subjects.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What makes Zapomint 2.0 special</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Badge className="mt-0.5 mr-2">LaTeX</Badge>
                <span>Full LaTeX support for mathematical notation</span>
              </li>
              <li className="flex items-start">
                <Badge className="mt-0.5 mr-2" variant="secondary">Tags</Badge>
                <span>Organize flashcards with customizable tags</span>
              </li>
              <li className="flex items-start">
                <Badge className="mt-0.5 mr-2" variant="outline">Search</Badge>
                <span>Quickly find flashcards with powerful search</span>
              </li>
              <li className="flex items-start">
                <Badge className="mt-0.5 mr-2">Responsive</Badge>
                <span>Works on desktop, tablet, and mobile devices</span>
              </li>
              <li className="flex items-start">
                <Badge className="mt-0.5 mr-2" variant="secondary">Dark Mode</Badge>
                <span>Easy on the eyes for night studying</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>LaTeX Examples</CardTitle>
            <CardDescription>Some examples of LaTeX support in Zapomint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Quadratic Formula</h3>
                <KaTeXComponent mathExpression="For $ax^2 + bx + c = 0$, the solution is given by:$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Euler's Identity</h3>
                <KaTeXComponent mathExpression="Euler's identity: $$e^{i\pi} + 1 = 0$$This beautiful equation combines the five most important constants in mathematics." />
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Maxwell's Equations</h3>
                <KaTeXComponent mathExpression="Maxwell's Equations in differential form:$$\begin{aligned}\nabla \cdot \vec{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \vec{B} &= 0 \\
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0\vec{J} + \mu_0\varepsilon_0\frac{\partial \vec{E}}{\partial t}\end{aligned}$$" />
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Einstein's Field Equations</h3>
                <KaTeXComponent mathExpression="Einstein's Field Equations:$$R_{\mu\nu} - \frac{1}{2}Rg_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$$" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Get in touch with us</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We're constantly working to improve Zapomint 2.0. If you have any questions,
              suggestions, or feedback, please don't hesitate to contact us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Email</h3>
                <p className="text-primary">support@zapomint.com</p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">GitHub</h3>
                <p className="text-primary">github.com/zapomint/zapomint2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
