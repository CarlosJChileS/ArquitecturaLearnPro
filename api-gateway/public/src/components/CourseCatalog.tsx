import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Play } from "lucide-react";
import { getCourses, getCategories } from "../api";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructor?: string;
  duration?: string;
  students?: number;
  rating?: number;
  level?: string;
  category?: string;
  price?: string;
}

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((err) => console.error(err));
    getCategories()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data) => setCategories(["Todos", ...data.map((c: any) => c.name)]))
      .catch((err) => console.error(err));
  }, []);
  return (
    <section id="cursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Catálogo de Cursos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre nuestra amplia selección de cursos diseñados por expertos de la industria
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "Todos" ? "default" : "outline"}
              className={category === "Todos" ? "bg-gradient-primary" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card 
              key={course.id} 
              className="group hover:shadow-glow transition-all duration-300 animate-scale-in border-0 bg-gradient-card overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-primary opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant="outline" 
                      className={`border-white text-white ${
                        course.price === "Premium" ? "bg-accent/80" : "bg-primary/80"
                      }`}
                    >
                      {course.price}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge 
                      variant="outline" 
                      className={`border-white text-white mb-2 ${
                        course.level === "Principiante" ? "bg-success/80" :
                        course.level === "Intermedio" ? "bg-warning/80" : "bg-destructive/80"
                      }`}
                    >
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                      <Play className="h-4 w-4 mr-2" />
                      Vista previa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  por {course.instructor}
                </p>
                <p className="text-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                
                <a href="/courses">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                    Ver Curso
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="/courses">
            <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground">
              Ver Todos los Cursos
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CourseCatalog;